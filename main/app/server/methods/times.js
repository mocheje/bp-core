Meteor.methods({

    "time/create": function(time){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        this.unblock();

        try {
            TimeWritings.insert(time);
            return true
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, e.message);
        }
    },
    "time/markAsSeen": function(businessUnitId, timeId){
        check(businessUnitId, String);
        this.unblock()

        let timeRecord = TimeWritings.findOne({_id: timeId})
        if(timeRecord && timeRecord.employeeId === Meteor.userId()) {            
            TimeWritings.update(timeId, {$set: {isApprovalStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that time record")
        }
    },
    "time/delete": function(timeId){
        this.unblock()

        let timeRecord = TimeWritings.findOne({_id: timeId})
        if(timeRecord && timeRecord.employeeId === Meteor.userId()) {
            if(timeRecord.status) {
                if(timeRecord.status === 'Approved' || timeRecord.status === 'Rejected') {
                    throw new Meteor.Error(401, `Unauthorized. Time record has already been ${timeRecord.status.toLowerCase()}`)
                } else {
                    TimeWritings.remove({_id: timeId})
                    return true;
                }
            } else {
                TimeWritings.remove({_id: timeId})
                return true;
            }
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that time record")
        }
    }
})