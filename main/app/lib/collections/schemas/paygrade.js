/**
 * Order Types Schema
 */
Core.Schemas.PayGrade = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String
    },
    description: {
        type: String
    },
    businessId: {
        type: String
    },
    positions: {
        type: [String]
    },
    payGroups: {
        type: [String]
    },
    status: {
        type: String,
        defaultValue: "Active",
        allowedValues: ["Active", "Inactive"]
    },
    payTypes: {
        // One of the keys in the object: payTypePositionId. 
        // When payrun is immediately exported to CSV, it specifies the order of the paytypes
        type: [Object],
        blackbox: true
    },

    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {
                    $setOnInsert: new Date
                };
            }
        },
        denyUpdate: true,
        optional: true
    }
});