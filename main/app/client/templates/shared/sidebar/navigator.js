import _ from 'underscore'


Template.navigator.events({
    'click #companyMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #payRulesMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #sapB1IntegrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #administrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #payrunsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #selfServiceMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #reportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #auditReportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #superAdminReportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    }
});

Template.navigator.helpers({
    'context': function(){
        return Session.get('context');
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    'isMenuExpanded': function(menuId) {
        let currentExpandedMenuId = Template.instance().expandedMenu.get()
        return menuId === currentExpandedMenuId
    },
    'isMenuExpandedFocusClass': function(menuId) {
        let currentExpandedMenuId = Template.instance().expandedMenu.get()
        return (menuId === currentExpandedMenuId) ? 'active' : ''
    },
    hasLeaveApprovalAccess: function () {
        return Core.hasLeaveApprovalAccess(Meteor.userId());
    },

    hasProcurementRequisitionApproveAccess: function () {
        let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
        return canApproveProcurement;
    },
    isProcurementRequisitionActive: function () {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isProcurementRequisitionActive
        } else {
            return false
        }
    },
    isUserASupervisor: function() {
        let currentUser = Meteor.users.findOne(Meteor.userId())
        if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let currentUserPosition = currentUser.employeeProfile.employment.position

            let numPositionsSupervising = EntityObjects.find({
                    otype: 'Position',
                    $or: [{'properties.supervisor' : currentUserPosition}, 
                        {'properties.alternateSupervisor': currentUserPosition}], 
                    businessId: Session.get('context')
                }).count()
            return (numPositionsSupervising > 0)
        }
    },
    hasTravelRequisitionApproveAccess: function () {
        let canApproveTrip = Core.hasTravelRequisitionApproveAccess(Meteor.userId());
        return canApproveTrip;
    },
    isTravelRequisitionActive: function () {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTravelRequisitionActive
        } else {
            return false
        }
    }, 
    hasPayrollReportsViewAccess: function () {
        let hasPayrollReportsViewAccess = Core.hasPayrollReportsViewAccess(Meteor.userId());
        return hasPayrollReportsViewAccess;
    },
    hasAuditReportsViewAccess: function () {
        let hasAuditReportsViewAccess = Core.hasAuditReportsViewAccess(Meteor.userId());
        return hasAuditReportsViewAccess;
    },
    hasProcurementReportsViewAccess: function () {
        return Core.hasProcurementReportsViewAccess(Meteor.userId());
    },
    'payGradeLabel': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabel
        } else {
            return "Pay Grade"
        }
    },
    'payGradeLabelPlural': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabelPlural
        } else {
            return "Pay Grades"
        }
    },
    'canApprovePayroll': function() {
        let userId = Meteor.userId()
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig) {
            let approvers = payrollApprovalConfig.approvers
            if(approvers && approvers.length > 0) {
                let currentUserIsApprover = _.find(approvers, anApproverId => {
                    return anApproverId === userId
                })
                return (currentUserIsApprover) ? true : false
            }
        }
    },
    'isLeaveAccrualByEntitlement': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.leaveDaysAccrual === 'FixedLeaveEntitlement'
        }
    },
    'isTimeTypeEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTimeTypeEnabled
        }
    },
    'isHmoSetupEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isHmoSetupEnabled
        }
    }
});

Template.navigator.onCreated(function () {
    let self = this

    //--
    self.expandedMenu = new ReactiveVar()
    //--
    self.businessUnitCustomConfig = new ReactiveVar()
    self.payrollApprovalConfig = new ReactiveVar()

    self.subscribe("getPositions", Session.get('context'));

    self.autorun(function() {
        let businessUnitId = Session.get('context');

        let payrollApprovalConfigSub = self.subscribe('PayrollApprovalConfigs', businessUnitId);

        if(payrollApprovalConfigSub.ready()) {
            let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId})
            self.payrollApprovalConfig.set(payrollApprovalConfig)
        }

        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                // console.log()
                self.businessUnitCustomConfig.set(res)
            }
        })
    })
});


Template.navigator.onRendered(function () {
    // Deps.autorun(function () {
    //     initAll();
    // });


   // Tooltip
//    $('.tooltips').tooltip({ container: 'body'});

//    //// Popover
//    //$('.popovers').popover();

//    // Show panel buttons when hovering panel heading
//    $('.panel-heading').hover(function() {
//       $(this).find('.panel-btns').fadeIn('fast');
//    }, function() {
//       $(this).find('.panel-btns').fadeOut('fast');
//    });

//    // Close Panel
//    $('.panel .panel-close').click(function() {
//       $(this).closest('.panel').fadeOut(200);
//       return false;
//    });

//    // Minimize Panel
//    $('.panel .panel-minimize').click(function(){
//       var t = $(this);
//       var p = t.closest('.panel');
//       if(!$(this).hasClass('maximize')) {
//          p.find('.panel-body, .panel-footer').slideUp(200);
//          t.addClass('maximize');
//          t.find('i').removeClass('fa-minus').addClass('fa-plus');
//          $(this).attr('data-original-title','Maximize Panel').tooltip();
//       } else {
//          p.find('.panel-body, .panel-footer').slideDown(200);
//          t.removeClass('maximize');
//          t.find('i').removeClass('fa-plus').addClass('fa-minus');
//          $(this).attr('data-original-title','Minimize Panel').tooltip();
//       }
//       return false;
//    });

//    $('.leftpanel .nav .parent > a').click(function() {

//       var coll = $(this).parents('.collapsed').length;

//       if (!coll) {
//          $('.leftpanel .nav .parent-focus').each(function() {
//             $(this).find('.children').slideUp('fast');
//             $(this).removeClass('parent-focus');
//          });

//          var child = $(this).parent().find('.children');
//          if(!child.is(':visible')) {
//             child.slideDown('fast');
//             if(!child.parent().hasClass('active'))
//                child.parent().addClass('parent-focus');
//          } else {
//             child.slideUp('fast');
//             child.parent().removeClass('parent-focus');
//          }
//       }
//       return false;
//    });


//    // Menu Toggle
//    $('.menu-collapse').click(function() {
//       if (!$('body').hasClass('hidden-left')) {
//          if ($('.headerwrapper').hasClass('collapsed')) {
//             $('.headerwrapper, .mainwrapper').removeClass('collapsed');
//          } else {
//             $('.headerwrapper, .mainwrapper').addClass('collapsed');
//             $('.children').hide(); // hide sub-menu if leave open
//          }
//       } else {
//          if (!$('body').hasClass('show-left')) {
//             $('body').addClass('show-left');
//          } else {
//             $('body').removeClass('show-left');
//          }
//       }
//       return false;
//    });

//    // Add class nav-hover to mene. Useful for viewing sub-menu
//    $('.leftpanel .nav li').hover(function(){
//       $(this).addClass('nav-hover');
//    }, function(){
//       $(this).removeClass('nav-hover');
//    });

//    // For Media Queries
//    $(window).resize(function() {
//       hideMenu();
//    });

//    hideMenu(); // for loading/refreshing the page
//    function hideMenu() {

//       if($('.header-right').css('position') == 'relative') {
//          $('body').addClass('hidden-left');
//          $('.headerwrapper, .mainwrapper').removeClass('collapsed');
//       } else {
//          $('body').removeClass('hidden-left');
//       }

//       // Seach form move to left
//       if ($(window).width() <= 360) {
//          if ($('.leftpanel .form-search').length == 0) {
//             $('.form-search').insertAfter($('.profile-left'));
//          }
//       } else {
//          if ($('.header-right .form-search').length == 0) {
//             $('.form-search').insertBefore($('.btn-group-notification'));
//          }
//       }
//    }

//    collapsedMenu(); // for loading/refreshing the page
//    function collapsedMenu() {

//       if($('.logo').css('position') == 'relative') {
//          $('.headerwrapper, .mainwrapper').addClass('collapsed');
//       } else {
//          $('.headerwrapper, .mainwrapper').removeClass('collapsed');
//       }
//    };
});
