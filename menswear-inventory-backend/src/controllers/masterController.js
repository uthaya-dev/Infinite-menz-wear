import Master from "../models/Master.js";

// CREATE
export const createMaster = async (req, res) => {
  try {
    const { name, type } = req.body;

    const normalizedName = name.toLowerCase().trim();

    const exists = await Master.findOne({
      name: normalizedName,
      type,
    });

    if (exists) {
      return res.status(400).json({ message: "Already exists" });
    }

    const master = await Master.create({
      name: normalizedName,
      type,
    });

    res.status(201).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (by type)
export const getMasters = async (req, res) => {
  try {
    const { type } = req.params;

    const data = await Master.find({ type }).sort({ name: 1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await Master.findByIdAndUpdate(id, { name }, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteMaster = async (req, res) => {
  try {
    const { id } = req.params;

    await Master.findByIdAndDelete(id);

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
