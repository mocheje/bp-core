/*****************************************************************************/
/* EntityCreate: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda'
Template.EntityCreate.events({
    'click #createEntity': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createEntity')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            name: $('[name="name"]').val(),
            parentId: getParent($('[name="level"]:checked').val()),
            otype: $('[name="otype"]').val(),
            status: $('[name="status"]').val(),
            properties: getProp()
        };
        function getParent(val) {
            if (!Template.instance().isroot.get()) {
                let entity = EntityObjects.findOne();
                switch (val) {
                    case "sibling":
                        //parent id = entity.parent
                        return entity.parentId;
                    case  "child":
                        return entity._id;
                }
            }else {
                return null;
            }

        };
        function getProp(){
           let prop = {};
            prop.supervisor =  $('[name="supervisor"]').val();
            prop.alternateSupervisor =  $('[name="alternateSupervisor"]').val();
            prop.costCenter = $('[name="costCenter"]').val();
            return prop;
        };
        if(tmpl.data.edit === "true"){//edit action for updating paytype
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("paytype/update", tmpl.data._id, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update object ${name}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update Node Object ${name}`, "success");
                    Modal.hide("EntityCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('entityObject/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('EntityCreate');
                    swal({
                        title: "Success",
                        text: `Node Object Created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                    window.location.reload()
                } else {
                    err = JSON.parse(err.details);
                    // add necessary handler on error
                    //use details from schema.key to locate html tag and error handler
                    _.each(err, (obj) => {
                        $('[name=' + obj.name +']').addClass('errorValidation');
                        $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);

                    })
                }
            });
        }
    },
    'change [name=otype]': (e, tmpl ) => {
        if ( $(e.target ).val() === 'Position' ) {
            tmpl.showProp.set(true);
        } else {
            tmpl.showProp.set(false);
        }
        //for unit show costcenters ... refactor code...
        if($(e.target ).val() === 'Unit' ){
            tmpl.ccAssignment.set(true);
        } else{
            tmpl.ccAssignment.set(false);
        }

    }
});

/*****************************************************************************/
/* EntityCreate: Helpers */
/*****************************************************************************/
Template.EntityCreate.helpers({
    'disabled': () => {
        //checks form and enable button when all is complete
        let condition = false;
        if(condition)
            return "disabled";
        return "";
    },
    'edit': () => {
        return Template.instance().data.action == "edit";
        //use ReactiveVar or reactivedict instead of sessions..
    },
    'parentName': (parentId) => {
        console.log("Parent id: " + parentId);

        if(parentId){
            return EntityObjects.findOne({_id: parentId}).name;
        }
        let root = Template.instance().isroot.get();
        if(root) {
            return BusinessUnits.findOne().name;
        } else {
            return EntityObjects.findOne().name;
        }
    },
    'checked': (prop) => {
        if(Template.instance().data)
            return Template.instance().data[prop];
        return false;
    },
    'selectedPos': () => {
        return Template.instance().showProp.get();
    },
    'positions': () => {
       return EntityObjects.find({otype: "Position"})
    },
    'unit': () => {
       return Template.instance().ccAssignment.get();
    },
    selected: function (context, val) {
        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.val matches
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    }
});

/*****************************************************************************/
/* EntityCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EntityCreate.onCreated(function () {
    //node root means company level parent id = null
    let self = this;
    self.showProp = new ReactiveVar();
    self.ccAssignment = new ReactiveVar(true);
    let baseCompany = self.data.node === "root";
    //set reactiveVar to indicate node selection
    self.isroot = new ReactiveVar( baseCompany );
    if(!baseCompany){
        self.subscribe("getEntity", self.data.node).wait;
    }
    self.subscribe("getPositions", Session.get('context'));


});

Template.EntityCreate.onRendered(function () {
    //init dropdown
    $('select.dropdown').dropdown();
    console.log('template data is ', Template.instance().data);
});

Template.EntityCreate.onDestroyed(function () {

});
