/*****************************************************************************/
/* HmoPlanChangeRequestCreate: Event Handlers */
/*****************************************************************************/
Template.HmoPlanChangeRequestCreate.events({
    // 'click #dismiss-modal': (e, tmpl) => {
    //     e.preventDefault()
    //     //--
    //     Modal.hide('HmoPlanChangeRequestCreate')
    // },
    'click #CreateRequest': (e, tmpl) => {
        let selectedHmoPlan = $('#hmoPlans').val()

        if(!selectedHmoPlan || selectedHmoPlan.length === 0) {
            tmpl.inputErrorMsg.set("Please select a HMO Plan")
            return
        }

        let hmoDoc = {
            employeeId: Meteor.userId(),
            hmoPlanType: selectedHmoPlan,
            businessId: Session.get('context')
        }
        let currentHmoPlanData = Template.instance().data
        if(currentHmoPlanData) {
            hmoDoc._id = currentHmoPlanData._id
        }

        Meteor.call('hmoPlanChangeRequests/create', hmoDoc, function(err, res) {
            if(!err) {
                if(currentHmoPlanData) {
                    swal('Successful', "Your HMO Plan Change was successful", 'success')
                } else {
                    swal('Successful', "Your HMO Plan Change Request was successful", 'success')
                }
                Modal.hide('HmoPlanChangeRequestCreate')
            } else {
                swal('Error', err.reason, 'error')
            }
        })
    }
});

/*****************************************************************************/
/* HmoPlanChangeRequestCreate: Helpers */
/*****************************************************************************/
Template.HmoPlanChangeRequestCreate.helpers({
    'hmoPlans': function () {
        return HmoPlans.find()
    },
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    },
    'data': () => {
        return Template.instance().data ? true:false;
    },
    prevSelectedHmoPlan: (hmoPlan) => {
        let data = Template.instance().data
        if(data) {
            return hmoPlan['_id'] === data['hmoPlanType']
        } else {
            return false
        }
    }
});


/*****************************************************************************/
/* HmoPlanChangeRequestCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlanChangeRequestCreate.onCreated(function () {
    let self = this;
    let businessId = Session.get('context')

    self.businessUnitCustomConfig = new ReactiveVar()

    self.inputErrorMsg = new ReactiveVar()

    self.subscribe('HmoPlansWithNoPagination', businessId);
});

Template.HmoPlanChangeRequestCreate.onRendered(function () {
    let self = this;

    // $('select.dropdown').dropdown();
});

Template.HmoPlanChangeRequestCreate.onDestroyed(function () {
});
