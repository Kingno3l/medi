import { Router } from "express";
import { z } from "zod";
import { getFacilitiesCollection, updateFacilityWaitTime } from "../firebase";
import { calculateHaversineDistance } from "../lib/haversine";

const router = Router();

const ResourcesQuerySchema = z.object({
  lat: z.coerce.number({ invalid_type_error: "Latitude must be a valid float value" }),
  lng: z.coerce.number({ invalid_type_error: "Longitude must be a valid float value" }),
  radius: z.coerce.number().default(2500),
  specialty: z.string().optional(),
  sort_by: z.enum(["distance", "wait_time"]).default("distance"),
  payment: z.enum(["all", "nhs", "private"]).default("all")
});

const ReportWaitSchema = z.object({
  facility_id: z.string(),
  wait_minutes: z.number().min(0).max(480)
});

// Dynamic resource discovery based on Haversine distance
router.get("/", async (req, res, next) => {
  try {
    const parsed = ResourcesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        errors: parsed.error.format()
      });
    }

    const { lat, lng, radius, specialty, sort_by, payment } = parsed.data;

    // Fetch resources from database (Firestore or dynamic fallback)
    const rawFacilities = await getFacilitiesCollection();

    const computed = rawFacilities
      .map((f) => {
        // Translate coordinate system map grid to lat/lng for Bristol, UK coordinates dynamically
        // BRI is lat: 51.4594, lng: -2.5984
        // Calculate dynamic relative latitude and longitude based on grid x, y
        const latOffset = (f.y - 32) * 0.00018; // approx 20 meters per unit
        const lngOffset = (f.x - 38) * 0.00028;
        
        const facilityLat = 51.4594 + latOffset;
        const facilityLng = -2.5984 + lngOffset;

        // Mathematical distance compute on the fly
        const distanceMiles = calculateHaversineDistance(lat, lng, facilityLat, facilityLng);
        const distanceMeters = Math.round(distanceMiles * 1609.34);

        return {
          ...f,
          distance: distanceMeters,
          latitude: facilityLat,
          longitude: facilityLng
        };
      })
      // Radius filter: default 2500m
      .filter((f) => f.distance <= radius)
      // Specialty capabilities filter
      .filter((f) => !specialty || f.specialties.includes(specialty as any))
      // NHS vs Private filter
      .filter((f) => payment === "all" || f.paymentModel === payment)
      // Sort logic
      .sort((a, b) =>
        sort_by === "distance" ? a.distance - b.distance : a.waitMinutes - b.waitMinutes
      );

    return res.status(200).json({
      status: "success",
      user_context: {
        processed_transiently: true,
        timestamp: new Date().toISOString()
      },
      results_count: computed.length,
      data: computed
    });
  } catch (err) {
    next(err);
  }
});

// Update wait time crowdsource reporting
router.post("/report", async (req, res, next) => {
  try {
    const parsed = ReportWaitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payload parameters",
        errors: parsed.error.format()
      });
    }

    const { facility_id, wait_minutes } = parsed.data;

    const success = await updateFacilityWaitTime(facility_id, wait_minutes);
    if (!success) {
      return res.status(404).json({
        status: "error",
        message: `Facility with ID ${facility_id} not found`
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Wait time reported successfully",
      reported: {
        facility_id,
        wait_minutes,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
