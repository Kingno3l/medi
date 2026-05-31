import { Router } from "express";
import { z } from "zod";
import { getTriageNode } from "../firebase";

const router = Router();

const TriageStepSchema = z.object({
  current_node_id: z.string(),
  user_selection: z.string()
});

router.post("/step", async (req, res, next) => {
  try {
    const parsed = TriageStepSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid triage payload parameters",
        errors: parsed.error.format()
      });
    }

    const { current_node_id, user_selection } = parsed.data;

    // Fetch node from rules engine
    const currentNode = await getTriageNode(current_node_id);
    if (!currentNode) {
      return res.status(404).json({
        status: "error",
        message: `Triage node ${current_node_id} not found`
      });
    }

    const option = currentNode.options?.[user_selection];
    if (!option) {
      return res.status(400).json({
        status: "error",
        message: `Option '${user_selection}' is not valid for node '${current_node_id}'`
      });
    }

    const nextNodeId = option.next_node_id;
    const nextNode = await getTriageNode(nextNodeId);

    if (!nextNode) {
      return res.status(500).json({
        status: "error",
        message: `Broken triage reference: Target node '${nextNodeId}' does not exist`
      });
    }

    return res.status(200).json({
      status: "success",
      current_node_id,
      next_node_id: nextNodeId,
      question_text: nextNode.question_text || null,
      action_type: nextNode.action_type,
      options: nextNode.options ? Object.entries(nextNode.options).map(([key, opt]) => ({
        key,
        label: opt.label
      })) : null,
      auto_filter_directives: option.filter_directives || null,
      payload: nextNode.payload || null
    });
  } catch (err) {
    next(err);
  }
});

// Fetch start node
router.get("/start", async (req, res, next) => {
  try {
    const startNode = await getTriageNode("triage_root");
    if (!startNode) {
      return res.status(500).json({
        status: "error",
        message: "Rules Engine missing start node 'triage_root'"
      });
    }

    return res.status(200).json({
      status: "success",
      node_id: startNode.node_id,
      question_text: startNode.question_text,
      options: startNode.options ? Object.entries(startNode.options).map(([key, opt]) => ({
        key,
        label: opt.label
      })) : null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
