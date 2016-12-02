
/**
 * Order Types Schema
 */
Core.Schemas.PayType = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String
    },
    title: {
        type: String
    },
    businessId: {
        type: String
    },
    type: {
        type: String,
        allowedValues: ["Wage", "Benefit", "Deduction", "One Off"],
        defaultValue: "Benefit"
    },
    frequency: {
        type: String,
        defaultValue: "Monthly",
        allowedValues: ["Weekly", "Bi-Monthly", "Monthly", "Quarterly", "Bi-Annually", "Annually"]
    },
    taxable: {
        type: Boolean,
        defaultValue: false
    },
    editablePerEmployee: {
        type: Boolean,
        defaultValue: false
    },
    derivative: {
        type: String,
        allowedValues: ["Fixed", "Formula"],
        defaultValue: "Fixed"
    },
    status: {
        type: String,
        defaultValue: "Active",
        allowedValues: ["Active", "Inactive"]
    },
    isBase: {
        type: Boolean,
        defaultValue: false
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