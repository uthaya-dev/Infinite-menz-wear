import Master from "../models/Master.js";

// CREATE
export const createMaster = async (req, res) => {
  try {
    const { name, type, primaryColor, secondaryColor } = req.body;

    if (type === "color") {
      if (!primaryColor) {
        return res.status(400).json({ message: "Primary color required" });
      }

      const exists = await Master.findOne({
        type,
        primaryColor: primaryColor.toLowerCase().trim(),
        secondaryColor: secondaryColor?.toLowerCase().trim() || "",
      });

      if (exists) {
        return res.status(400).json({ message: "Already exists" });
      }

      const master = await Master.create({
        type,
        primaryColor: primaryColor.toLowerCase().trim(),
        secondaryColor: secondaryColor?.toLowerCase().trim() || "",
      });

      return res.status(201).json(master);
    }

    // NORMAL TYPES
    const normalizedName = name.toLowerCase().trim();

    const exists = await Master.findOne({ name: normalizedName, type });

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
    const { name, primaryColor, secondaryColor, type } = req.body;

    let updateData = {};

    if (type === "color") {
      updateData = {
        primaryColor,
        secondaryColor,
      };
    } else {
      updateData = {
        name,
      };
    }

    const updated = await Master.findByIdAndUpdate(id, updateData, {
      new: true,
    });

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

// DELETE ALL BY TYPE
export const deleteAllMastersByType = async (req, res) => {
  try {
    const { type } = req.params;

    await Master.deleteMany({ type });

    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
