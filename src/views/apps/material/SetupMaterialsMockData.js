export const materialsData = {
    "leftTable": [
      {
        "id": 1,
        "materialCode": "SE235-SE380805-6",
        "materialType": "SE235 0*5.0",
        "thickness": 6100,
        "weight": 1.39
      },
      {
        "id": 2,
        "materialCode": "SE235-SE380805-6",
        "materialType": "SE235 0*5.0",
        "thickness": 6500,
        "weight": 1.39
      },
      {
        "id": 3,
        "materialCode": "SE355-SE380805-6",
        "materialType": "SE355 0*5.0",
        "thickness": 6100,
        "weight": 1.39
      },
      // ... more items can be added
    ],
    "rightTable": [
      {
        "id": 1,
        "systemCode": "MS-F003058-001",
        "bbCode": "F003058-1000",
        "cbCode": "F025045-6500",
        "bWidth": 10.00,
        "cWidth": 100,
        "quantity": 5
      },
      {
        "id": 2,
        "systemCode": "MS-F010033-001",
        "bbCode": "F010033-1000",
        "cbCode": "F018033-1000",
        "bWidth": 15.00,
        "cWidth": 20,
        "quantity": 7
      },
      {
        "id": 3,
        "systemCode": "MS-F010033-001",
        "bbCode": "F016033-1000",
        "cbCode": "F003058-1000",
        "bWidth": 10.00,
        "cWidth": 100,
        "quantity": 5
      }
      // ... more items can be added
    ]
  };
  
  // Full mock data structure
  export const mockData = {
    materials: materialsData,
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalLeftRecords: materialsData.leftTable.length,
      totalRightRecords: materialsData.rightTable.length
    }
  };