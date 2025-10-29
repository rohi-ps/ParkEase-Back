const vehicleRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;

const isValidVehicleNumber = (number) => vehicleRegex.test(number);

const isValidVehicleType = (type) => ["2W", "4W"].includes(type);

const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  const [year, month, day] = dateString.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
};

const isValidTime = (timeString) =>/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(timeString);

const validateReservation = (data) => {
  const requiredFields = ["slotID","VehicleType","vehicleNumber","EntryDate","EntryTime","ExitDate","ExitTime"];
  for (const field of requiredFields) {
    if (!data[field]) return `Missing field: ${field}`;
  }

  if (!isValidVehicleNumber(data.vehicleNumber)) {
    return "Invalid vehicle number format. Use TN01AB5678";
  }

  if (!isValidVehicleType(data.VehicleType)) {
    return "Vehicle type must be '2W' or '4W'";
  }

  if (!isValidDate(data.EntryDate) || !isValidDate(data.ExitDate)) {
    return "Date must be valid and in YYYY-MM-DD format";
  }

  if (!isValidTime(data.EntryTime) || !isValidTime(data.ExitTime)) {
    return "Time must be valid and in HH:mm format";
  }

  const entry = new Date(`${data.EntryDate}T${data.EntryTime}`);
  const exit = new Date(`${data.ExitDate}T${data.ExitTime}`);

  if (exit.getTime() < entry.getTime()) {
    if (data.ExitDate < data.EntryDate) {
      return "Exit date must be after entry date";
    } else if (data.ExitDate === data.EntryDate &&data.ExitTime <= data.EntryTime) {
      return "Exit time must be after entry time on the same day";
    }
  }
};

module.exports = {validateReservation};
