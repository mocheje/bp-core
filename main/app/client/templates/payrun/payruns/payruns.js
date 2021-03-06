/*****************************************************************************/
/* payruns: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.payruns.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
    },
    'click #get-employee-payresults': (e, tmpl) => {
        let paymentPeriodMonth = $('[name="paymentPeriodMonth"]').val();
        let paymentPeriodYear = $('[name="paymentPeriodYear"]').val();

        let period = paymentPeriodMonth + paymentPeriodYear;

        Template.instance().currentPayrunPeriod.set(period);
    },
    'click .excel': (e, tmpl) => {
        e.preventDefault();
        const month = $('[name="paymentPeriodMonth"]').val();
        const year = $('[name="paymentPeriodYear"]').val();
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
            Meteor.call('exportPaymentsforPeriod', Session.get('context'), period, function(err, res){
                console.log(res);
                if(res){
                    //call the export fo
                    BulkpayExplorer.exportAllData(res, "Payment Report");
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }
    },
    'click #postToSap': (e,tmpl) => {
        let currentPayrun = Template.instance().currentPayrun.get();

        if(currentPayrun) {
            tmpl.$('#postToSap').text('Please wait ... ');
            tmpl.$('#postToSap').attr('disabled', true);
            //--
            let resetButton = function() {
                tmpl.$('#postToSap').text('Post results to SAP');
                tmpl.$('#postToSap').removeAttr('disabled');
            };
            //--
            const month = $('[name="paymentPeriodMonth"]').val();
            const year = $('[name="paymentPeriodYear"]').val();
            let period = `${month}${year}`

            Meteor.call("sapB1integration/postPayrunResults", Session.get('context'), period, (err, res) => {
                resetButton()
                console.log(`res: ${JSON.stringify(res)}`)
                if (!err) {
                    if(res) {
                        let responseAsObj = JSON.parse(res)
                        if(responseAsObj.status === true) {
                            swal("Payrun Post Status", responseAsObj["message"], "success");
                        } else {
                            if(responseAsObj.errors) {
                                let errors = responseAsObj.errors
                                console.log(`Errors: ${JSON.stringify(errors)}`)
                                Modal.show('PayrunResultsPostToSapErrors', errors)
                            } else if(responseAsObj.message) {
                                swal("Payrun Post Status", responseAsObj.message, "error");
                            } else {
                                swal("Payrun Post Status", "A server error occurred. Please try again later", "error");
                            }
                        }
                    } else {
                        swal("Payrun Post Status", "A server error occurred. Please try again later", "error");
                    }
                } else {
                    swal("Payrun Post Status", err.message, "error");
                }
            })
        }
    }, 
    'click #payrunDelete': function(e, tmpl) {
        event.preventDefault();
        
        const month = $('[name="paymentPeriodMonth"]').val();
        const year = $('[name="paymentPeriodYear"]').val();
        let period = `${month}${year}`
        let businessId = Session.get('context')

        swal({
            title: "Are you sure?",
            text: "You will not be able to undo this",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, () => {
            Meteor.call('payrun/delete', period, businessId, function(err, res) {
                if(!err){
                    swal("Deleted!", `Payrun deleted successfully.`, "success");
                }
            })
        });
    }
});

/*****************************************************************************/
/* payruns: Helpers */
/*****************************************************************************/
Template.payruns.helpers({
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
    },
    'approvalState': (approval) => {
        if(approval === true) {
            return 'Approved';
        } else if(approval === false) {
            return 'Rejected';
        } else {
            return ''
        }
    },
    'increment': (index) => {
        return index += 1;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        let years = [];
        for (let x = new Date().getFullYear() - 10; x < new Date().getFullYear() + 50; x++) {
            years.push(String(x));
        }
        return years;
    },
    'payrun': function(){
        return Template.instance().currentPayrun.get();
    },

    'errorMsg': function() {
        return Template.instance().errorMsg.get();
    },
    'payrunResultsPostToSapErrors': function() {
        return Template.instance().payrunResultsPostToSapErrors.get();
    },
    'approvals': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig) {
            let currentPayrun = Template.instance().currentPayrun.get() || []
            let firstOne = currentPayrun[0]

            if(firstOne) {
                return firstOne.approvals
            }
        }
    },
    'doesRequirePayrunApproval': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        
        if(payrollApprovalConfig) {
            return payrollApprovalConfig.requirePayrollApproval
        } else {
            return false
        }
    },
    'showPayrunDeleteButton': function() {
        let currentPayrun = Template.instance().currentPayrun.get()

        return (currentPayrun !== null) && Core.hasPayrollAccess(Meteor.userId())
    },
    'canPostToSAP': function() {
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig && payrollApprovalConfig.requirePayrollApproval) {
            let currentPayrun = Template.instance().currentPayrun.get() || []
            let firstOne = currentPayrun[0]

            if(firstOne) {
                let isApproved = true                
                _.each(firstOne.approvals, anApproval => {
                    if(!anApproval.isApproved) {
                        isApproved = false
                    }
                })
                if(isApproved) {
                    return true
                }
            }
        } else {
            return true
        }
    }
});

/*****************************************************************************/
/* payruns: Lifecycle Hooks */
/*****************************************************************************/
Template.payruns.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));

    self.currentPayrun = new ReactiveVar();
    self.currentPayrun.set(false);

    self.currentPayrunPeriod = new ReactiveVar();
    self.currentPayrunPeriod.set(null);

    self.errorMsg = new ReactiveVar();
    //self.errorMsg.set("No Payrun available");

    self.payrollApprovalConfig = new ReactiveVar()

    let businessId = Session.get('context')


    self.autorun(() => {
        let currentPayrunPeriod = Template.instance().currentPayrunPeriod.get();
        self.subscribe("Payruns", currentPayrunPeriod, businessId);
        self.subscribe('PayrollApprovalConfigs', businessId);

        if (self.subscriptionsReady()) {
          let payRun = Payruns.find({period: currentPayrunPeriod, businessId}).fetch();
            
          let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId})
          self.payrollApprovalConfig.set(payrollApprovalConfig)

          if(payRun && payRun.length > 0)
            Template.instance().currentPayrun.set(payRun);
          else
            Template.instance().currentPayrun.set(null);
            Template.instance().errorMsg.set("No Payrun available for that time period");
        }
    });
});

Template.payruns.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.payruns.onDestroyed(function () {
});


//----------

Template.singlePayrunResult.helpers({
  'getEmployeeFullName': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
      return employee.profile.fullName;
    else
      return ""
  },
  'getEmployeeRealId': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
      return employee.employeeProfile.employeeId;
    else
      return ""
  }
});

Template.singlePayrunResult.events({
    'click .anEmployeePayResult': (e, tmpl) => {
        //console.log("this context: " + JSON.stringify(Template.parentData()));
        let thisContext = Template.parentData();

        let businessUnitId = Session.get('context')

        Meteor.call('Payslip/getSelfPayslipForPeriod', businessUnitId, thisContext.period, thisContext.employeeId, function(err, res) {
            if(!err) {
                let selfPayrun = res.selfPayrun
                let selfPayResults = res.selfPayResults

                let payLoadForPayslip = {
                    payrun: selfPayrun,
                    payslip: selfPayResults.payslip, 
                    payslipWithCurrencyDelineation: selfPayResults.payslipWithCurrencyDelineation,
                    displayAllPaymentsUnconditionally: true
                }
                Modal.show('Payslip', payLoadForPayslip);
            } else {
                tmpl.errorMsg.set(err.message);
            }
        })
    }
});


/*****************************************************************************/
/* PayrunResultsPostToSapErrors: Helpers */
/*****************************************************************************/
Template.PayrunResultsPostToSapErrors.helpers({
    'payrunResultsPostToSapErrors': function() {
        return Template.instance().payrunResultsPostToSapErrors.get();
    }
});

/*****************************************************************************/
/* PayrunResultsPostToSapErrors: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunResultsPostToSapErrors.onCreated(function () {
    let self = this;

    self.payrunResultsPostToSapErrors = new ReactiveVar()
    self.payrunResultsPostToSapErrors.set(self.data);
});

Template.PayrunResultsPostToSapErrors.onDestroyed(function () {
    Modal.hide('PayrunResultsPostToSapErrors')
});
