
/**
 * Leave Types Schema
 */


Core.Schemas.LeaveType = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    positionIds: {
        type: [String],
        label: "Positions",
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female', 'All'],
        optional: true
    },
    payGradeIds: {
        type: [String],
        label: "Pay Grades",
        optional: true
    },
    maximumDuration: {
        type: Number,
        optional: true
    },
    paid: {
        type: Boolean,
        defaultValue: true
    },
    deductFromAnnualLeave: {
        type: Boolean,
        defaultValue: true
    },
    businessId: {
        type: String
    },
    status: {
        type: String,
        defaultValue: 'Active',
        allowedValues: ['Active', 'Inactive'],
        optional: true
    },
    deductFrom: {
        type: [String],
        optional: true
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
        denyUpdate: true
    }

})

Core.Schemas.Leave = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    startDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: 'calendar datepicker',
                type: "bootstrap-datetimepicker"
            }
        }
    },
    endDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: 'calendar datepicker',
                type: "bootstrap-datetimepicker"
            }
        }
    },
    duration: {
        type: Number,
        autoform: {
            readonly: true
        },
        decimal: true,
        optional: true
    },
    durationInHours: {
        type: Number
    },
    type: {
        type: String,
        custom: function () {
            if (Meteor.isClient && this.isSet) {
                let selectedType = this.value;
                let duration = parseInt(this.siblingField("duration").value);
                let selectedQuota = parseInt(LeaveTypes.findOne({_id: selectedType}).maximumDuration);
                console.log(selectedQuota);
                if(duration > selectedQuota){
                    console.log("got here");
                    Core.Schemas.Leave.namedContext('leavesForm').addInvalidKeys([{name: "type", type: "ExceededDays" }]);
                }
                //Meteor.call("accountsIsUsernameAvailable", this.value, function (error, result) {
                //    if (!result) {
                //        Meteor.users.simpleSchema().namedContext("createUserForm").addInvalidKeys([{name: "username", type: "notUnique"}]);
                //    }
                //});
            }
        }

    },
    description: {
        type: String,
        optional: true
    },
    approvedBy: {
        type: String,
        optional: true
    },
    approvedDate: {
        type: Date,
        optional: true
    },
    businessId: {
        type: String
    },
    employeeId: {
        type: String,
        index: 1,
        autoform: {
            type: "hidden",
            label: false
        },
        autoValue: function() {
            if (this.isInsert) {
                if (this.isSet && Meteor.isServer) {
                    return this.value;
                } else {
                    return this.userId;
                }
            }
        },
        optional: true,
        denyUpdate: true
    },
    relieverUserId: {
        type: String,
        optional: true
    },
    'approvals': {
        type: [Object],
        optional: true   // It is optional because the business may NOT have twoStepApproval enabled
    },
    'approvals.$': {
        type: Object,
        optional: true
    },
    'approvals.$.approverUserId': {
        type: String
    },
    'approvals.$.firstApprover': {
        type: Boolean
    },
    'approvals.$.secondApprover': {
        type: Boolean
    },
    'approvals.$.approvalStatus': {
        type: String
    },
    'approvals.$.recommendationText': {
        type: String,
        optional: true
    },
    approvalStatus: {
        type: String,
        defaultValue: 'Open',
        allowedValues: ['Open', 'Approved', 'Rejected'],
        optional: true
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    isApprovalStatusSeenByCreator: {
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
        denyUpdate: true
    }
});
