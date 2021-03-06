/*****************************************************************************/
/* ProjectCreate: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda';

Template.ProjectCreate.events({

    'click #addActivity': (e,tmpl) => {
        e.preventDefault();
        Template.instance().isAnActivityBeingCreated.set(true);
    },
    'click .deleteActivity': (e,tmpl) => {
        e.preventDefault();
        e.stopPropagation();    // To prevent 'click .anActivity' from being called

        const rowElement = e.currentTarget.closest('tr');
        let jqueryRowElement = $(rowElement);
        let activityId = jqueryRowElement.attr('id');
        console.log("Activity id: " + activityId);

        Meteor.call('activity/delete', activityId, (err, res) => {
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
    },
    'click .anActivity': (e, tmpl) => {
      let taxRuleRowElement = e.currentTarget;

      let activityRowName = taxRuleRowElement.getAttribute("name");
      if(activityRowName) {
        let activityParts = activityRowName.split("_");
        let activityIndex = activityParts[1];
        activityIndex = parseInt(activityIndex);

        Template.instance().indexOfSelectedActivityForEdit.set(activityIndex);
        Template.instance().isAnActivitySelectedForEdit.set(true);
      }
    },
    'click #confirmActivityCreate': (e, tmpl) => {
      const rowElement = e.currentTarget.closest('tr');
      let jqueryRowElement = $(rowElement);
      //--
      let rowFullCode = jqueryRowElement.find('td [name="activityFullCode"]');
      let rowFullCodeVal = rowFullCode.val();

      let rowDescription = jqueryRowElement.find('td [name="activityDescription"]');
      let rowDescriptionVal = rowDescription.val();

      e.stopPropagation();    // To prevent 'click .anActivity' from being called

      if(!rowFullCodeVal || rowFullCodeVal.trim().length == 0) {
        //swal("Validation error", `Please enter a fullcode for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a fullcode for your activity`);
      } else if(!rowDescriptionVal || rowDescriptionVal.trim().length == 0) {
        //swal("Validation error", `Please enter a description for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a description for your activity`);
      } else {
        Template.instance().errorMessage.set(null);

        let l = Ladda.create(tmpl.$('#confirmActivityCreate')[0]);
        l.start();

        let projectId = Template.instance().projectDetails.get()._id;
        let newActivity = {
            fullcode: rowFullCodeVal,
            description: rowDescriptionVal,
            type: "project",
            unitOrProjectId : projectId,
            businessId : Session.get('context')
        };

        Meteor.call('activity/create', newActivity, (err, res) => {
            l.stop();
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
        Template.instance().isAnActivityBeingCreated.set(false);
      }
    },
    'click #confirmActivityEdit': (e, tmpl) => {
      const rowElement = e.currentTarget.closest('tr');
      let jqueryRowElement = $(rowElement);
      let activityId = jqueryRowElement.attr('id');
      console.log("Activity id: " + activityId);
      //--
      let rowFullCode = jqueryRowElement.find('td [name="activityFullCode"]');
      let rowFullCodeVal = rowFullCode.val();

      let rowDescription = jqueryRowElement.find('td [name="activityDescription"]');
      let rowDescriptionVal = rowDescription.val();

      e.stopPropagation();    // To prevent 'click .anActivity' from being called

      if(!rowFullCodeVal || rowFullCodeVal.trim().length == 0) {
        //swal("Validation error", `Please enter a fullcode for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a fullcode for your activity`);
      } else if(!rowDescriptionVal || rowDescriptionVal.trim().length == 0) {
        //swal("Validation error", `Please enter a description for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a description for your activity`);
      } else {
        Template.instance().errorMessage.set(null);

        let l = Ladda.create(tmpl.$('#confirmActivityEdit')[0]);
        l.start();

        //let projectId = Template.instance().projectDetails.get()._id;
        let updatedActivity = {
            fullcode: rowFullCodeVal,
            description: rowDescriptionVal
        };

        Meteor.call('activity/update', activityId, updatedActivity, (err, res) => {
            l.stop();
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
        Template.instance().indexOfSelectedActivityForEdit.set(null);
        Template.instance().isAnActivitySelectedForEdit.set(false);
      }
    },
    'click #cancelActivityEdit': (e, tmpl) => {
      e.preventDefault();
      e.stopPropagation();    // To prevent 'click .aTaxRuleItem' from being called

      Template.instance().isAnActivityBeingCreated.set(false);
      Template.instance().indexOfSelectedActivityForEdit.set(null);
      Template.instance().isAnActivitySelectedForEdit.set(false);
    }
});

/*****************************************************************************/
/* ProjectCreate: Helpers */
/*****************************************************************************/
Template.ProjectCreate.helpers({
    'positions': () => {
        return EntityObjects.find().fetch().map(x => {
            return {label: x.name, value: x._id}
        })
    },
    'status': () => {
        return [{label: "Active", value: "Active"},{label: "Inactive", value: "Inactive"}];
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'businessIdHelper': () => {
        return Session.get('context')
    },
    'formType': () => {
        if(Template.instance().data)
            return "projectForm";
        return "updateProjectForm";
    },
    'data': () => {
        return Template.instance().data ? true:false;
    },
    'errorMessage': () => {
        return Template.instance().errorMessage.get();
    },
    'activities': () => {
        let projectDetails = Template.instance().projectDetails.get();

        return Activities.find({type: "project", unitOrProjectId: projectDetails._id});
    },
    'editableActivities': () => {
        return Template.instance().editableProjectActivities.get();
    },
    'isAnActivityBeingCreated' : function() {
      return Template.instance().isAnActivityBeingCreated.get();
    },
    'isActivitySelected' : function() {
      return Template.instance().isAnActivitySelectedForEdit.get();
    },
    'indexOfSelectedActivity' : function() {
      return Template.instance().indexOfSelectedActivityForEdit.get();
    },
});



/*****************************************************************************/
/* ProjectCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.ProjectCreate.onCreated(function () {
    let self = this;

    //subscribe to positions and paygrades
    self.subscribe('getPositions', Session.get('context'));

    self.projectDetails = new ReactiveVar();
    self.projectDetails.set(Template.instance().data || {});
    // the {} is important because this template is used for both project create and edit

    //--
    self.editableProjectActivities = new ReactiveVar();
    self.editableProjectActivities.set(null);

    self.isAnActivityBeingCreated = new ReactiveVar();
    self.isAnActivityBeingCreated.set(false);

    self.isAnActivitySelectedForEdit = new ReactiveVar();
    self.isAnActivitySelectedForEdit.set(false);

    self.indexOfSelectedActivityForEdit = new ReactiveVar();
    self.indexOfSelectedActivityForEdit.set(null);

    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    self.autorun(function () {
        let activitiesSubscription = self.subscribe('activities', "project", self.projectDetails.get()._id);

        if (activitiesSubscription.ready()) {
            console.log("activities subscription is ready");
            let activitiesFromDb = Activities.find({
                type: "project",
                unitOrProjectId: self.projectDetails.get()._id
            }).fetch();
            self.editableProjectActivities.set(activitiesFromDb);
        }
    });
});

Template.ProjectCreate.onRendered(function () {
    let self = this;
    $('select.dropdown').dropdown();
});

Template.ProjectCreate.onDestroyed(function () {
    Modal.hide("ProjectCreate");
});
