/**
 *  Activities Methods
 */
Meteor.methods({
    "activity/create": function(activity){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(activity, Core.Schemas.Activity);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the activity. Please correct and retry");
        }
        this.unblock();

        let newActivityId = Activities.insert(activity);
        return {_id: newActivityId};
    },
    "activity/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        let numberOfTimeRecords = Times.find({activity: id}).count();
        if(numberOfTimeRecords > 0) {
            let errMsg = "Sorry, that activity can't be deleted because it is used by a time record.";
            throw new Meteor.Error(409, errMsg);
        } else {
          Activities.remove({_id: id});
          return true;            
        }
    },
    "activity/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission

        check(id, String);
        const selector = {
            _id: id
        };
        const result = Activities.update(selector, {$set: details} );
        return result;
    }
});

