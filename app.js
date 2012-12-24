(function($){
	var contacts = [
        { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
	];

var Contact = Backbone.Model.extend({
	defaults: {
		photo: "/img/placeholder.png",
		name: "",
		address: "",
		tel: "",
		email: "",
		type: ""
	}
});

var Directory = Backbone.Collection.extend({
	model: Contact
});

var ContactView = Backbone.View.extend({
	tagName: "article",
	className: "contact-container",
	template: $("#contactTemplate").html(),
	render: function(){
		var tpl = _.template(this.template);
		this.$el.html(tpl(this.model.toJSON()));
		return this;
	},
	events: {
		"click button.delete": "deleteContact"
	},
	deleteContact: function(){
		var removedType = this.model.get("type").toLowerCase();
		this.model.destroy();
		this.remove();
		if(_.indexOf(directory.getTypes(), removedType) === -1){
			directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
		}
	}
});

var DirectoryView = Backbone.View.extend({
    el: $("#contacts"),
    initialize: function () {
        this.collection = new Directory(contacts);
        this.render();
        //$('#filter').append(this.createSelect());
        this.$el.find("#filter").append(this.createSelect());

        //event handler for change event which calls callback filterByType and passes "this" context
        this.on("change:filterType", this.filterByType, this);

        //listens for reset event handler and then calls this.render to repopulate the contacts, also passes
        //this for context without it you won't be able to access your collection from inside render()
        this.collection.on("reset", this.render, this);
        this.collection.on("add", this.renderContact, this);
        this.collection.on("remove", this.removeContact, this);
    },
    render: function () {
    	//hides unwanted contacts
        this.$el.find("article").remove();

        _.each(this.collection.models, function (item) {
            this.renderContact(item);
        }, this);
    },
    renderContact: function (item) {
        var contactView = new ContactView({
            model: item
        });
        this.$el.append(contactView.render().el);
    },
    getTypes: function () {
        return _.uniq(this.collection.pluck("type"), false, function (type) {
            return type.toLowerCase();
        });
    },
    createSelect: function () {
            var filter = this.$el.find("#filter"),
                select = $("<select/>", {
                    html: "<option value='all'>All</option>"
                });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });

            return select;
    },
    events: {
    	"change #filter select": "setFilter",
    	"click #add": "addContact"
    },
    setFilter: function(e){
    	this.filterType = e.currentTarget.value;
    	this.trigger("change:filterType");
    },
    filterByType: function(){
    	if(this.filterType === "all"){
    		this.collection.reset(contacts);
    		contactsRouter.navigate("filter/all");
    	}else{
    		this.collection.reset(contacts, {silent:true});
    		var filterType = this.filterType,
    			filtered = _.filter(this.collection.models, function(item){
    				return item.get("type").toLowerCase() === filterType;
    			});
    		this.collection.reset(filtered);
    		contactsRouter.navigate("filter/" + filterType);
    	}
    },
    addContact: function(e){
    	e.preventDefault();
    	var newModel = {};
    	$("#addContact").children("input").each(function(i, el){
    		if($(el).val() !== ""){
    			newModel[el.id] = $(el).val();
    		}
    	});
    	contacts.push(newModel);
    	//basically indexOf checks if the second parameter exists in the getTypes() array returns -1 if the value is not present
    	if(_.indexOf(this.getTypes(), newModel.type) === -1){
    		this.collection.add(new Contact(newModel));
    		this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
    	}else{
    		this.collection.add(new Contact(newModel));
    	}
    },
    removeContact: function(removedModel){
    	var removed = removedModel.attributes;
    	if(removed.photo === "/img/placeholder.png"){
    		delete removed.photo;
    	}
    	_.each(contacts, function(contact){
    		if(_.isEqual(contact, removed)){
    			contacts.splice(_.indexOf(contacts, contact), 1);
    		}
    	})
    }
});

var ContactsRouter = Backbone.Router.extend({
	routes: {
		"filter/:type": "urlFilter"
	},
	urlFilter: function(type){
		directory.filterType = type;
		directory.trigger("change:filterType");
	}
});

//create instance of contact master
var directory = new DirectoryView(),
	contactsRouter = new ContactsRouter();

Backbone.history.start();

}(jQuery));
