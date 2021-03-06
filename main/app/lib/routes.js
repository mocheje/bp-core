/*
 * Main Routing and Security Configurations
 * uses iron:router package.
 */
Router.configure({
    notFoundTemplate: "NotFound",
    loadingTemplate: "Loading",

    onRun: function () {
        //$(window).scrollTop(0);
        //Core.clearActionView();
        this.next();
    }
});

/*
 * Main Useraccounts config
 */
AccountsTemplates.configure({
    defaultLayout: 'ExtLayout',
    showResendVerificationEmailLink: true,
    showForgotPasswordLink: true,
    enablePasswordChange: true
});

// Account routes
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('verifyEmail');
AccountsTemplates.configureRoute('resendVerificationEmail');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('changePwd');


// default home routes
Router.route('/', {
    name: 'home',
    controller: 'BusinessUnitController',
    action: 'home',
    where: 'client'
});

// Router.route('/sendOneOffEnrollmentEmails', function() {
//     console.log('routes.js file ... inside sendOneOffEnrollmentEmails')

//     let users =  Meteor.users.find({"businessIds": {"$in" : ["udrayHAGvXXDgzzGf"]}}).fetch();
//     console.log(`Num users: ${users.length}`)
//     let successfulEmailsSent = 0

//     let userEmailsToSendTo = ["roy.abdallah@deltatekoffshore.com"]

//     for (let aUser of users) {
//         try {
//             if(userEmailsToSendTo.indexOf(aUser.emails[0].address) > -1) {
//               console.log(`aUser id: ${aUser._id} ... Email: ${aUser.emails[0].address}`)
//               Accounts.sendEnrollmentEmail(aUser._id, aUser.emails[0].address);

//               successfulEmailsSent += 1
//               console.log(`Email sent successfully`)
//             }
//         } catch(e) {
//            console.log(`Exception : ${e.message}`)
//         }
//     }
//     console.log(`successfulEmailsSent: ${successfulEmailsSent}`)

//     this.response.write("All emails sent")
//     this.response.end()
// }, {where: 'server'});

/*
 Router.route('/login', {
 name: 'login',
 layoutTemplate: 'ExtLayout',
 template: 'Login'
 });*/

Router.route('/send-reset-password-link', {
    name: 'send.reset-passwordlink',
    layoutTemplate: 'ExtLayout',
    template: 'SendPasswordResetLink'
});

Router.route('/resetPassword/:token', {
    name: 'reset.password',
    layoutTemplate: 'ExtLayout',
    template: 'ResetMyPassword'
});

Router.route('/business/:_id', {
    name: 'bu.details',
    controller: 'BusinessUnitController',
    action: 'show',
    where: 'client'
});
Router.route('/business/:_id/payslip', {
    name: 'payslip',
    controller: 'PayslipController',
    action: 'showSelfPaySlips',
    where: 'client'
});

Router.route('/business/:_id/orgchart', {
    name: 'orgchart',
    controller: 'OrgChartController',
    where: 'client'

});
Router.route('/business/:_id/profile', {
    name: 'bu.profile',
    controller: 'BusinessUnitProfileController',
    where: 'client'

});

Router.route('/business/:_id/paygroups', {
    name: 'paygroups',
    controller: 'PaygroupsController',
    where: 'client'
});

Router.route('/business/:_id/entity/:id', {
    name: 'entity',
    controller: 'EntityController',
    where: 'client'
});

Router.route('/business/:_id/paytypes', {
    name: 'paytypes',
    controller: 'PaytypesController',
    where: 'client'
});

Router.route('/business/:_id/constants', {
    name: 'constant.list',
    controller: 'ConstantsController',
    where: 'client'
});

Router.route('/business/:_id/currencies', {
    name: 'currency.list',
    controller: 'CurrenciesController',
    where: 'client'
});

Router.route('/business/:_id/leavetypes', {
    name: 'leavetypes',
    controller: 'LeaveTypesController',
    action: 'list',
    where: 'client'
});
Router.route('/business/:_id/timetypes', {
    name: 'timetypes',
    controller: 'TimeTypesController',
    action: 'list',
    where: 'client'
});
Router.route('/business/:_id/hmoplans', {
    name: 'hmoplans',
    controller: 'HmoPlansController',
    action: 'list',
    where: 'client'
});
Router.route('/business/:_id/hmoplans/changerequest', {
    name: 'hmoplans.changerequest',
    controller: 'HmoPlansController',
    action: 'changeRequest',
    where: 'client'
});


Router.route('/business/:_id/paygrades', {
    name: 'paygrades',
    controller: 'PaygradesController',
    where: 'client'
});

Router.route('/business/:_id/taxes', {
    name: 'taxes',
    controller: 'TaxesController',
    where: 'client'
});

Router.route('/business/:_id/pensions', {
    name: 'pensions',
    controller: 'PensionsController',
    where: 'client'
});

Router.route('/business/:_id/employees', {
    name: 'employees',
    controller: 'EmployeesController',
    where: 'client'
});
Router.route('/business/:_id/employee/:employeeId/profile', {
    name: 'employee.profile',
    controller: 'EmployeeProfileController',
    where: 'client'
});

Router.route('/business/:_id/employee/new', {
    name: 'employees.create',
    controller: 'EmployeesController',
    action: 'create',
    where: 'client'
});
Router.route('/business/:_id/employee/time', {
    name: 'employee.time',
    controller: 'EmployeesController',
    action: 'time',
    where: 'client'
});
Router.route('/business/:_id/employee/time/approve', {
    name: 'employee.time.approve',
    controller: 'EmployeesController',
    action: 'approveTime',
    where: 'client'
});

Router.route('/business/:_id/projects', {
    name: 'project.list',
    controller: 'EmployeesController',
    where: 'client'
});
Router.route('/business/:_id/employee/expense', {
    name: 'employee.expense',
    controller: 'EmployeesController',
    action: 'expense',
    where: 'client'
});

Router.route('tenant/signup', {
    name: 'new.tenant',
    controller: 'TenantsController',
    where: 'client'
});

Router.route('/business/:_id/loans/new', {
    name: 'loans.new',
    controller: 'LoansController',
    where: 'client',
    action: 'create'
});

Router.route('/business/:_id/loans', {
    name: 'loans.manage',
    controller: 'LoansController',
    where: 'client',
    action: 'list'
});

Router.route('/business/:_id/oneoffs', {
  name: 'oneoff',
  controller: 'OneoffController',
  where: 'client'
});

Router.route('/business/:_id/additional', {
    name: 'additional.pay',
    controller: 'AdditionalController',
    where: 'client'
});

Router.route('/business/:_id/payrun/new', {
  name: 'payrun.new',
  controller: 'PayrunController',
  where: 'client'
});

Router.route('/business/:_id/sap/config', {
  name: 'sap.config',
  controller: 'SAPConfigController',
  where: 'client',
  action: 'showConfig'
});

Router.route('/business/:_id/payruns', {
  name: 'payruns',
  controller: 'PayrunController',
  where: 'client'
});
Router.route('/tenant/settings', {
    name: 'tenant.settings',
    controller: 'HomeController',
    action: 'settings',
    where: 'client'
});

Router.route('/business/:_id/employee/leaves', {
    name: 'leave.list',
    controller: 'EmployeesController',
    where: 'client'
});
Router.route('/business/:_id/employee/leave/entitlements', {
    name: 'leave.entitlement.list',
    controller: 'LeaveEntitlementController',
    action: 'showLeaveEntitlementsList',
    where: 'client'
});
Router.route('/business/:_id/employee/leave/balances', {
    name: 'leave.balances.list',
    controller: 'LeaveBalancesController',
    action: 'showLeaveBalancesList',
    where: 'client'
});
Router.route('/business/:_id/employee/leave/approvals', {
    name: 'leave.myapprovals',
    controller: 'EmployeesController',
    action: 'showMyLeaveApprovals',
    where: 'client'
});


Router.route('/business/:_id/employee/procurementrequisitions', {
    name: 'procurementrequisition.list',
    controller: 'RequisitionController',
    action: 'showProcurementRequisitionsList',
    where: 'client'
});
Router.route('/business/:_id/employee/procurementrequisitions/approvalslist', {
    name: 'procurementrequisition.approvalList',
    controller: 'RequisitionController',
    action: 'showProcurementRequisitionApprovalList',
    where: 'client'
});
Router.route('/business/:_id/employee/procurementrequisitions/treatlist', {
    name: 'procurementrequisition.treatList',
    controller: 'RequisitionController',
    action: 'showProcurementRequisitionTreatList',
    where: 'client'
});

Router.route('/business/:_id/employee/travelrequests', {
    name: 'travelrequests.list',
    controller: 'RequisitionController',
    action: 'showTravelRequestsList',
    where: 'client'
});
Router.route('/business/:_id/employee/travelrequests/approvalslist', {
    name: 'travelrequests.approvalList',
    controller: 'RequisitionController',
    action: 'showTravelRequestApprovalList',
    where: 'client'
});
Router.route('/business/:_id/employee/travelrequests/treatlist', {
    name: 'travelrequests.treatList',
    controller: 'RequisitionController',
    action: 'showTravelRequestTreatList',
    where: 'client'
});

Router.route('/business/:_id/reports/netpay', {
    name: 'reports.netpay',
    controller: 'ReportsController',
    action: 'netpay',
    where: 'client'
});

Router.route('/business/:_id/reports/tax', {
    name: 'reports.tax',
    controller: 'ReportsController',
    action: 'tax',
    where: 'client'
});

Router.route('/business/:_id/reports/pension', {
    name: 'reports.pension',
    controller: 'ReportsController',
    action: 'pension',
    where: 'client'
});

Router.route('/business/:_id/reports/comprehensive', {
    name: 'reports.comprehensive',
    controller: 'ReportsController',
    action: 'comprehensive',
    where: 'client'
});

Router.route('/business/:_id/reports/timewriting', {
    name: 'reports.timewriting',
    controller: 'ReportsController',
    action: 'timewriting',
    where: 'client'
});

Router.route('/business/:_id/reports/procurement', {
    name: 'reports.procurement',
    controller: 'ReportsController',
    action: 'procurement',
    where: 'client'
});

Router.route('/business/:_id/reports/leaverequests', {
    name: 'reports.leaverequests',
    controller: 'ReportsController',
    action: 'leaveRequests',
    where: 'client'
});

Router.route('/business/:_id/reports/travelrequisition', {
    name: 'reports.travelrequisition',
    controller: 'ReportsController',
    action: 'travelRequest',
    where: 'client'
});

Router.route('/business/:_id/reports/employees', {
    name: 'reports.employees',
    controller: 'ReportsController',
    action: 'employees',
    where: 'client'
});

Router.route('/business/:_id/superadmin/reports/users', {
    name: 'superadmin.reports.users',
    controller: 'SuperAdminReportsController',
    action: 'getUsersWithDefaultOrRealPassword',
    where: 'client'
});

Router.route('/business/:_id/payroll/approvalconfig', {
    name: 'payroll.approvalconfig',
    controller: 'PayrollApprovalConfigController',
    action: 'showConfig',
    where: 'client'
});

Router.route('/business/:_id/payrun/approval', {
    name: 'payroll.approval',
    controller: 'PayrunController',
    action: 'showPayrunApproval',
    where: 'client'
});

Router.route('/business/:_id/payrun/approval/:payrunPeriod', {
    name: 'payroll.approval.period',
    controller: 'PayrunController',
    action: 'showPayrunApproval',
    where: 'client'
});
