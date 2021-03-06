
/*****************************************************************************/
/* PensionReport: Event Handlers */
/*****************************************************************************/
Template.PensionReport.events({
    'click .getResult': (e, tmpl) => {
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(month && year) {
            const period = month + year;
            Meteor.call('getPensionResult', Session.get('context'), period, function(err, res){
                if(res && res.length){
                    console.log('logging response as ', res);
                    tmpl.dict.set('result', res);
                } else {
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }

    },
    'click .excel': (e, tmpl) => {
        event.preventDefault();
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(month && year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);


            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('.excel').text(' Export to CSV');
                // Add back glyphicon
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };

            const period = month + year;
            Meteor.call('exportPensionResult', Session.get('context'), period, function(err, res){
                if(res){
                    //call the export fo
                    BulkpayExplorer.exportAllData(res, "Pension Report");
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }

    }
});

/*****************************************************************************/
/* PensionReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.PensionReport.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'result': () => {
        return Template.instance().dict.get('result');
    }
});

/*****************************************************************************/
/* PensionReport: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionReport.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

});

Template.PensionReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.PensionReport.onDestroyed(function () {
});
