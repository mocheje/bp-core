import _ from 'underscore';

/*****************************************************************************/
/* LeaveCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveCreate.events({
    'change #startDate': function(e, tmpl) {
        let start = $("#startDate").val();
        let end = $("#endDate").val();
        if (start && end){
            // let duration = tmpl.getNumberOfWeekDays(start, end)

            let durationAsDaysAndHours = tmpl.prettifyDurationOfWeekDaysInDaysAndHours(start, end)
            $("#duration").val(durationAsDaysAndHours)
        }
    },
    'change #endDate': function(e, tmpl) {
        let start = $("#startDate").val();
        let end = $("#endDate").val();
        if (start && end){
            // let duration = tmpl.getNumberOfWeekDays(start, end)

            let durationAsDaysAndHours = tmpl.prettifyDurationOfWeekDaysInDaysAndHours(start, end)
            $("#duration").val(durationAsDaysAndHours)
        }
    },
    'change #allowLeavesInHours': function(e, tmpl) {
        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        if(allowLeavesInHours) {
            Template.instance().isAllowingHoursLeave.set(true)
        } else {
            Template.instance().isAllowingHoursLeave.set(false)
        }
    },
    'click #LeaveCreate': (e, tmpl) => {
        e.preventDefault()

        let start = $("#startDate").val();
        if(!start || start.length === 0) {
            tmpl.inputErrorMsg.set("Please select a start date")
            return
        }
        let startDateObj = moment(start).toDate()
        let endDateObj = null

        let durationAsNumber = 0

        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        let selectedLeaveType = $('#leaveTypes').val()

        if(allowLeavesInHours) {
            let duration = $('#duration').val();
            durationAsNumber = parseInt(duration)

            if(isNaN(durationAsNumber)) {
                tmpl.inputErrorMsg.set("Please enter the duration of leave(in hours)")
                return
            } else if(durationAsNumber < 1) {
                tmpl.inputErrorMsg.set("Please enter the duration of leave(in hours) greater than zero")
                return
            } else {
                endDateObj = moment(start).add(duration, 'hour').toDate()
            }
        } else {
            let end = $("#endDate").val();
            if(!end || end.length === 0) {
                tmpl.inputErrorMsg.set("Please select a end date")
                return
            }
            endDateObj = moment(end).toDate()

            durationAsNumber = tmpl.getDurationOfWeekDaysInHours(start, end) / 24  // in days
        }
        if(!selectedLeaveType || selectedLeaveType.length === 0) {
            tmpl.inputErrorMsg.set("Please select a leave type")
            return
        }
        let description = $('#description').val() || "";
        //--
        let leaveDoc = {
            employeeId: Meteor.userId(),
            startDate: startDateObj,
            endDate: endDateObj,
            type: selectedLeaveType,
            description: description,
            businessId: Session.get('context')
        }
        if(allowLeavesInHours) {
            leaveDoc.duration = durationAsNumber / 24 
            leaveDoc.durationInHours = durationAsNumber
        } else {
            leaveDoc.duration = durationAsNumber
            leaveDoc.durationInHours = durationAsNumber * 24
        }
        //--
        let currentYear = moment().year()
        let currentYearAsNumber = parseInt(currentYear)

        Meteor.call('leave/create', leaveDoc, currentYearAsNumber, function(err, res) {
            if(!err) {
                swal('Successful', "Leave request successful", 'success')
            } else {
                swal('Error', err.reason, 'error')
            }
        })
    }
});

/*****************************************************************************/
/* LeaveCreate: Helpers */
/*****************************************************************************/
Template.LeaveCreate.helpers({
    'leaveTypes': function () {
        let allLeaveTypes = LeaveTypes.find().fetch() || []
        let user = Meteor.users.findOne(Meteor.userId())

        if(user) {
            let userPaygrade = user.employeeProfile.employment.paygrade

            let allowedLeaveTypes = []
    
            allLeaveTypes.forEach(aLeaveType => {
                let allowedPaygrades = aLeaveType.payGradeIds
                
                let isLeaveTypeAllowed = _.find(allowedPaygrades, aPayGrade => {
                    return aPayGrade === userPaygrade
                })
                if(isLeaveTypeAllowed) {
                    allowedLeaveTypes.push(aLeaveType)
                }
            })
            return allowedLeaveTypes
        } else {
            return []
        }
    },
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    },
    leaveInDaysMode : function() {
        return !Template.instance().isAllowingHoursLeave.get()
    },
    isHourLeaveRequestsEnabled: function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isHourLeaveRequestsEnabled
        }
    },
    numberOfLeaveDaysLeft: function() {
        return Template.instance().numberOfLeaveDaysLeft.get() || '---'
    },
    startOfToday: function() {
        return moment().startOf('day').toDate()
    },
    endOfToday: function() {
        return moment().endOf('day').toDate()
    }
});


/*****************************************************************************/
/* LeaveCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveCreate.onCreated(function () {
    let self = this;
    let businessId = Session.get('context')

    self.profile = new ReactiveDict();
    self.isAllowingHoursLeave = new ReactiveVar();
    self.isAllowingHoursLeave.set(false)

    self.isHourLeaveRequestsEnabled = new ReactiveVar()

    self.numberOfLeaveDaysLeft = new ReactiveVar();

    self.businessUnitCustomConfig = new ReactiveVar()

    self.inputErrorMsg = new ReactiveVar()

    self.getNumberOfWeekDays = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)

        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays >= 0) {
            let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

            if(businessUnitCustomConfig && !businessUnitCustomConfig.isWeekendIncludedInLeaveRequests) {
                if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                    weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
                }
            } else {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        let numOfWeekDays = weekDates.length + 1

        return weekDates.length
    }

    self.getDurationOfWeekDaysInHours = function(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)
        //--
        let numberOfHoursInPeriod = endDateMoment.diff(startDateMoment, 'hours')
        let numberOfHoursInPeriodWeekDays = numberOfHoursInPeriod
        //--
        let numberOfDays = endDateMoment.diff(startDateMoment, 'days')

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays >= 0) {
            let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

            if(businessUnitCustomConfig && !businessUnitCustomConfig.isWeekendIncludedInLeaveRequests) {
                if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                    weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
                } else {
                    numberOfHoursInPeriodWeekDays -= (24)
                }
            } else {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        return numberOfHoursInPeriodWeekDays
    }

    self.prettifyDurationOfWeekDaysInDaysAndHours = function(startDate, endDate) {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            if(businessUnitCustomConfig.isHourLeaveRequestsEnabled) {
                let durationInHours = self.getDurationOfWeekDaysInHours(startDate, endDate)
                let numberOfDaysInHours = Math.floor(durationInHours / 24) 
        
                if(numberOfDaysInHours < 1) {
                    return durationInHours + ' hours'
                } else {
                    let hoursLeft = (durationInHours - (numberOfDaysInHours * 24))
                    let durationPrettified = numberOfDaysInHours + ' day(s), ' + hoursLeft + ' hours'
                    return durationPrettified
                }
            } else {
                let durationInDays = self.getNumberOfWeekDays(startDate, endDate)
                return durationInDays
            }
        }
    }

    self.setLeaveDaysLeftBasedOnFixedEntitlement = function() {
        let userEntitlementSubs = self.subscribe('UserLeaveEntitlement', businessId, Meteor.userId())
        let allLeaveEntitlements = self.subscribe('LeaveEntitlements', businessId)

        if(userEntitlementSubs.ready() && allLeaveEntitlements.ready()){
            let userLeaveEntitlement = UserLeaveEntitlements.findOne({
                businessId: businessId, userId: Meteor.userId()
            })

            if(userLeaveEntitlement) {
                let userDaysLeftHistory = userLeaveEntitlement.leaveDaysLeft
                let currentYear = moment().year()
                let currentYearAsNumber = parseInt(currentYear)

                let foundDaysLeftInYear = _.find(userDaysLeftHistory, (aYearData, indexOfYear) => {
                    if(aYearData.year === currentYearAsNumber) {
                        indexOfFoundYear = indexOfYear
                        return true
                    }
                })
                if(foundDaysLeftInYear) {
                    self.numberOfLeaveDaysLeft.set(foundDaysLeftInYear.daysLeft)
                }
            }
        }
    }

    self.setLeaveDaysLeftBasedOnDaysWorked = function() {
        let suppLeavesForUser = SupplementaryLeaves.findOne({businessId: businessId, employees: {$in: [Meteor.userId()]}});

        let user = Meteor.users.findOne(Meteor.userId())
        let numberOfDaysSinceResumption = 0
        if(user) {
            let hireDate = user.employeeProfile.employment.hireDate
            if(hireDate) {
                let hireDateAsMoment = moment(hireDate)

                numberOfDaysSinceResumption = moment().diff(hireDateAsMoment, 'days')
            }
        }
        //--
        let hoursOfLeaveApproved = 0
        let userApprovedLeaves = Leaves.find({
            businessId: businessId, 
            employeeId: Meteor.userId(),
            approvalStatus: 'Approved'
        }).fetch();

        userApprovedLeaves.forEach(aLeave => {
            hoursOfLeaveApproved += aLeave.durationInHours
        })
        //--
        let numSupplementaryLeaveDays = 0
        if(suppLeavesForUser) {
            numSupplementaryLeaveDays = suppLeavesForUser.numberOfLeaveDays
        }
        //--
        let numberOfLeaveDaysLeft = (0.056 * numberOfDaysSinceResumption) - (hoursOfLeaveApproved / 24) + numSupplementaryLeaveDays

        self.numberOfLeaveDaysLeft.set(numberOfLeaveDaysLeft.toFixed(2))
    }

    self.subscribe('employeeLeaveTypes', businessId);
    let employeeApprovedLeavesSub = self.subscribe('employeeApprovedLeaves', businessId)
    let suppLeavesForUserSub = self.subscribe('supplementaryLeaveForUser', businessId, Meteor.userId())

    self.autorun(function() {
        if(employeeApprovedLeavesSub.ready() && suppLeavesForUserSub.ready()) {
            Meteor.call('BusinessUnitCustomConfig/getConfig', businessId, function(err, businessUnitCustomConfig) {
                self.businessUnitCustomConfig.set(businessUnitCustomConfig)
                
                if(businessUnitCustomConfig.leaveDaysAccrual === 'FixedLeaveEntitlement') {
                    self.setLeaveDaysLeftBasedOnFixedEntitlement()
                } else if(businessUnitCustomConfig.leaveDaysAccrual === 'NumberOfDaysWorked') {
                    self.setLeaveDaysLeftBasedOnDaysWorked()
                }
            })
        }
    })
});

Template.LeaveCreate.onRendered(function () {
    let self = this;
    // self.$('select.dropdown').dropdown();

    //disable submit temporary fix
    // $('#LeaveCreate').prop('disabled', true);

    let start = $("#startDate").val();
    let end = $("#endDate").val();
    if (start && end){
        let duration = self.getNumberOfWeekDays(start, end)
        $("#duration").val(duration <= 0 ? 0 : duration + ' day(s)')
    }

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType)
        }
        $("#type,#endDate,#startDate").on("change", function () {
            let duration = parseInt($("#duration").val());
            let selectedType = $('#type').val();

            if (duration && selectedType){
                let selectedQuota = parseInt(LeaveTypes.findOne({_id: selectedType}).maximumDuration);
                //get remaining quota of employee.
                //validate using autoform validation or custom function
                if(duration > selectedQuota){
                    $(this).addClass('errorValidation');
                    $("#duration").addClass('errorValidation');
                    $('#LeaveCreate').prop('disabled', true);
                } else {
                    $('#endDate').removeClass('errorValidation');
                    $('#startDate').removeClass('errorValidation');
                    $('#type').removeClass('errorValidation');
                    $("#duration").removeClass('errorValidation');
                    $('#LeaveCreate').prop('disabled', false);
                }
            }
        });
    });
});

Template.LeaveCreate.onDestroyed(function () {
});
