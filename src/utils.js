const tableStyle = {
  chars: {
    top: "",
    "top-mid": "",
    "top-left": "",
    "top-right": "",
    bottom: "",
    "bottom-mid": "",
    "bottom-left": "",
    "bottom-right": "",
    left: "",
    "left-mid": "",
    mid: "",
    "mid-mid": "",
    right: "",
    "right-mid": "",
    middle: " ",
  },
  style: { "padding-left": 0, "padding-right": 0 },
};

// Include zero padded variants of the number
const numberView = (key, value) => {
  if (value === undefined) return {};
  return {
    [key]: value,
    [key + "0"]: value < 10 ? "0" + value : value,
    [key + "00"]:
      value < 10 ? "00" + value : value < 100 ? "0" + value : value,
  };
};

// Include variant without special characters
const stringView = (key, value) => {
  if (value === undefined) return {};
  return {
    [key]: value,
    [key + "Simple"]: value.replace(/[^a-zA-Z0-9\s]/g, ""),
    [key + "Safe"]: value.replace(/[^a-zA-Z0-9]/g, "").replace(/\s/g, "_"),
  };
};

const parseKeyValue = (str, prev) => {
  const [key, value] = str.split("=");
  return { ...prev, [key]: value };
};

module.exports = {
  tableStyle,
  numberView,
  stringView,
  parseKeyValue,
};
