/*****************************************************************************/
/* TimeCreate2: Event Handlers */
/*****************************************************************************/
Template.TimeCreate2.events({
    'change [name="costElement"]': (e, tmpl) => {
        let selected = $(e.target).val();
        if(selected) {
            if(selected && selected === 'leave') {
                Modal.hide('TimeCreate2')
                setTimeout(function() {
                    Modal.show('LeaveCreate')
                }, 1000)
            } else {
                Template.instance().selectedElement.set(selected);
            }
        }
    },
    'change [name="projects"]': (e,tmpl) => {
        let project = $(e.target).val();
        tmpl.project.set(project);
    },
    'change [name="costCenters"]': (e,tmpl) => {
        let center = $(e.target).val();
        tmpl.costCenter.set(center);
    },
    'click .datesForTimeWriting': (e, tmpl) => {
        let element = e.currentTarget
        let dayIndex = element.getAttribute('data-dayNum')

        tmpl.currentDayIndex.set(parseInt(dayIndex))
        let businessId = Session.get('context')

        let dayToFindTimesFor = tmpl.datesForTimeWriting.get()[dayIndex]

        Meteor.subscribe('timesForDay', businessId, dayToFindTimesFor)
    },
    'click #TimeCreate': (e, tmpl) => {
        e.preventDefault()

        let costElement = $('[name="costElement"]:checked').val();

        let costElementId = null
        if(costElement) {
            if(costElement === 'project') {
                costElementId = $('[name="projects"]').val();
            } else if(costElement === 'costCenter') {
                costElementId = $('[name="costCenters"]').val();
            }
        }
        if(!costElementId || costElementId.length === 0) {
            if(costElement === 'project') {
                swal('Validation error', "Please select a project", 'error')
            } else if(costElement === 'costCenter') {
                swal('Validation error', "Please select a cost center", 'error')
            }
            return
        }
        let activityId = $('[name="activities"]').val();
        if(!activityId || activityId.length === 0) {
            swal('Validation error', "Please select an activity", 'error')
            return
        }

        let currentDayIndex = Template.instance().currentDayIndex.get()
        let datesForTimeWriting = Template.instance().datesForTimeWriting.get()
        let day = datesForTimeWriting[currentDayIndex]

        let duration = $('#duration').val();
        let durationAsNumber = parseInt(duration)

        let hoursToTimeWriteForCurrentDay = tmpl.hoursToTimeWriteForCurrentDay.get()

        let isOvertimeEnabled = false;
        const businessUnitCustomConfig = tmpl.businessUnitCustomConfig.get();
        if(businessUnitCustomConfig) {
            isOvertimeEnabled = businessUnitCustomConfig.isOvertimeEnabled
        }

        if(isOvertimeEnabled) {
            let allowOvertime = $('#allowOvertime').is(":checked")
            if(allowOvertime) {
                if(durationAsNumber > 24) {
                    swal('Validation error', "You cannot record overtime more than 24 hours on the same day", 'error')
                    return
                }
            } else if(durationAsNumber > hoursToTimeWriteForCurrentDay) {
                swal('Validation error', "You cannot record time more than your number of hours left for the day", 'error')
                return
            }
        } else {
            if(durationAsNumber > hoursToTimeWriteForCurrentDay) {
                swal('Validation error', "You cannot record time more than your number of hours left for the day", 'error')
                return
            }
        }

        let note = $('#note').val() || "";
        //--
        let timeDoc = {
            employeeId: Meteor.userId(),
            activity: activityId,
            day: day,
            duration: durationAsNumber,
            note: note,
            businessId: Session.get('context')
        }
        if(costElement === 'project') {
            timeDoc.project = costElementId
        } else if(costElement === 'costCenter') {
            timeDoc.costCenter = costElementId
        }
        //--
        Meteor.call('time/create', timeDoc, function(err, res) {
            if(!err) {
                swal('Successful', "Time recorded successful", 'success')
            } else {
                swal('Error', err.reason, 'error')
            }
        })
    }
});

/*****************************************************************************/
/* TimeCreate2: Helpers */
/*****************************************************************************/
Template.TimeCreate2.helpers({
    'projects': function () {
        const projects = Projects.find().fetch().map(x => {
            return {label: x.name, value: x._id};
        });
        return projects;
    },
    'costCenters': function () {
        const centers = EntityObjects.find({otype: 'Unit'}).fetch().map(x => {
            return {label: x.name, value: x._id};
        });
        return centers;
    },
    'projectSelected': function() {
        return Template.instance().selectedElement.get() === "project";
    },
    'costCenterSelected': function() {
        return Template.instance().selectedElement.get() === "costCenter";
    },
    'formType': () => {
        if(Template.instance().data)
            return "TimeForm";
        return "updateTimeForm";
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'projectActivities': () => {
        const id = Template.instance().project.get();
        let activities = Activities.find({type: "project", unitOrProjectId: id}).fetch();

        let activitiesForDisplay = activities.map(x => {
            return {
                label: `${x.fullcode} - ${x.description}`,
                value: x._id
            };
        })
        return activitiesForDisplay;
    },
    'costCenterActivities': () => {
        const id = Template.instance().costCenter.get();
        let activities = Activities.find({type: "unit", unitOrProjectId: id}).fetch();

        let activitiesForDisplay = activities.map(x => {
            return {
                label: `${x.fullcode} - ${x.description}`,
                value: x._id
            };
        })
        return activitiesForDisplay;
    },
    'datesForTimeWriting': function() {
        return Template.instance().data
    },
    'getDayFromDate': function(date) {
        let theMoment = moment(date)
        return theMoment.format('D')
    },
    'currentDayIndex': function(date) {
        return Template.instance().currentDayIndex.get()
    },
    'isTimeAvailableToTimeWriteForCurrentDay': function() {
        return Template.instance().hoursToTimeWriteForCurrentDay.get() > 0 ? true : false
    },
    'hoursToTimeWriteForCurrentDay': function() {
        return Template.instance().hoursToTimeWriteForCurrentDay.get()
    },
    'isOvertimeEnabled': function() {
        const businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get();
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isOvertimeEnabled
        }
    }
});


/*****************************************************************************/
/* TimeCreate2: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeCreate2.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();
    self.project = new ReactiveVar();
    self.costCenter = new ReactiveVar();
    self.selectedElement = new ReactiveVar("project");

    self.datesForTimeWriting = new ReactiveVar()
    self.datesForTimeWriting.set(self.data)

    self.currentDayIndex = new ReactiveVar()
    if(self.datesForTimeWriting.get().length > 0) {
        self.currentDayIndex.set(0)
    }

    self.businessUnitCustomConfig = new ReactiveVar()

    self.hoursToTimeWriteForCurrentDay = new ReactiveVar(0)
    //self.hoursToTimeWriteForCurrentDay.set(8)

    const businessId = Session.get('context')

    self.subscribe('employeeprojects', Session.get('context'));
    self.subscribe('getCostElement', Session.get('context'));
    self.subscribe('AllActivities', Session.get('context'));

    //--
    self.autorun(function(){
        if(!self.subscriptionsReady()) {
            return
        }

        let currentDayIndex = self.currentDayIndex.get()

        let dayToFindTimesFor = self.datesForTimeWriting.get()[currentDayIndex]
        var dayStart = moment(dayToFindTimesFor).startOf('day').toDate();
        var dayEnd = moment(dayToFindTimesFor).endOf('day').toDate();

        let timesRecordedForDay = TimeWritings.find({
            employeeId: Meteor.userId(), 
            day: {$gte: dayStart, $lt: dayEnd}
        }).fetch();

        let numberOfHoursTimewritedFor = 0
        timesRecordedForDay.forEach(aTime => {
            numberOfHoursTimewritedFor += aTime.duration
        })
        
        const businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get();
        if(businessUnitCustomConfig) {
            const maxHoursInDayForTimeWriting = businessUnitCustomConfig.maxHoursInDayForTimeWriting || 8
            self.hoursToTimeWriteForCurrentDay.set(maxHoursInDayForTimeWriting - numberOfHoursTimewritedFor)
        }
    });

    Meteor.call('BusinessUnitCustomConfig/getConfig', businessId, function(err, res) {
        if(!err) {
            self.businessUnitCustomConfig.set(res)
        }
    })
});

Template.TimeCreate2.onRendered(function () {
    let self = this;

    $("html, body").animate({ scrollTop: 0 }, "slow");
    
    // $('#TimeCreate').prop('disabled', true);

    // self.autorun(function() {
    //     $("#duration").on("change", function () {
    //         let duration = $("#duration").val();
    //         console.log(`[onRendered] duration: ${duration}`)
    //         let hoursToTimeWriteForCurrentDay = self.hoursToTimeWriteForCurrentDay.get()

    //         if (duration){
    //             let durationAsHours = parseInt(duration)
    //             if (durationAsHours <= hoursToTimeWriteForCurrentDay){
    //                 $('#TimeCreate').prop('disabled', false);
    //             } else {
    //               $('#TimeCreate').prop('disabled', true);
    //             }
    //         }
    //     });
    // });
});

Template.TimeCreate2.onDestroyed(function () {
});
