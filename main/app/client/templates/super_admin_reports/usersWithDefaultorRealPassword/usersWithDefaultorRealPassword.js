
/*****************************************************************************/
/* UsersWithDefaultorRealPassword: Event Handlers */
/*****************************************************************************/

Template.UsersWithDefaultorRealPassword.events({
    'click #excel': function(e, tmpl) {
        e.preventDefault();

    },

    'click #exportReportForUsersWithRealPassword': function(e, tmpl) {
        e.preventDefault();
        tmpl.$('#exportReportForUsersWithRealPassword').text('Preparing... ');
        tmpl.$('#exportReportForUsersWithRealPassword').attr('disabled', true);
        try {
            let l = Ladda.create(tmpl.$('#exportReportForUsersWithRealPassword')[0]);
            l.start();
        } catch(e) {
        }
        //--
        let resetButton = function() {
            try {
                let l = Ladda.create(tmpl.$('#exportReportForUsersWithRealPassword')[0]);
                l.stop();
                l.remove();
            } catch(e) {
            }

            tmpl.$('#exportReportForUsersWithRealPassword').text('Export');
            $('#exportReportForUsersWithRealPassword').prepend("<i class='glyphicon glyphicon-download'></i>");
            tmpl.$('#exportReportForUsersWithRealPassword').removeAttr('disabled');
        };

        let reportColumns = ['empId', 'firstName', 'lastName', 'email', 'parents', 'payGrade']
        let reportData = Template.instance().usersWithRealPassword.get()

        BulkpayExplorer.exportAllData({fields: reportColumns, data: reportData}, 
            `Users with real password report`);
    }
});

/*****************************************************************************/
/* UsersWithDefaultorRealPassword: Helpers */
/*****************************************************************************/

Template.UsersWithDefaultorRealPassword.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'usersWithDefaultPassword': function() {
        return Template.instance().usersWithDefaultPassword.get()
    },
    'usersWithRealPassword': function() {
        return Template.instance().usersWithRealPassword.get()
    },
    'isLastIndex': function(array, currentIndex) {
        return (currentIndex === (array.length - 1))
    },
    'isFetchingData': function() {
        return Template.instance().isFetchingData.get()
    }
});

/*****************************************************************************/
/* UsersWithDefaultorRealPassword: Lifecycle Hooks */
/*****************************************************************************/
Template.UsersWithDefaultorRealPassword.onCreated(function () {
    let self = this;

    self.usersWithDefaultPassword = new ReactiveVar()
    self.usersWithRealPassword = new ReactiveVar()

    self.isFetchingData = new ReactiveVar(true)

    Meteor.call('superAdminReports/getUsersWithDefaultPassword', 
        Session.get('context'), function(err, res) {
        if(res) {
            self.usersWithDefaultPassword.set(res.daarUsersWithDefaultPassword)
            self.usersWithRealPassword.set(res.daarUsersWithRealPassword)
        } else {
            swal('No result found', err.reason, 'error');
        }
        self.isFetchingData.set(false)
    });
});

Template.UsersWithDefaultorRealPassword.onRendered(function () {
    self.$('select.dropdown').dropdown();
});

Template.UsersWithDefaultorRealPassword.onDestroyed(function () {
});
