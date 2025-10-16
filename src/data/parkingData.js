const parkingLogs= [
  {
        id: 1,
        vehicleNumber: "MH14CD5678",
        customerName: "Devraj Patil",
        vehicleType: "2W",
        slotId: "B-02",
        entryTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        exitTime: new Date(Date.now() - 3600000), // 1 hour ago
        status: "Completed"
    },
    {
        id: 2,
        vehicleNumber: "MH09EF9101",
        customerName: "Jagannath Kar",
        slotId: "C-03",
        entryTime: new Date(Date.now() - 1800000), // 30 minutes ago
        exitTime: null,
        status: "Parked"
    }
];
module.exports=parkingLogs;