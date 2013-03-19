
Books = new Meteor.Collection('Books');


if (Meteor.isClient) {
  var active_book;
  Session.set('selected_book', null);


  Meteor.startup(function () {
     Books.allow({
        insert: function(){return true;},
        update: function(){return true;},
        remove: function(){return true;}
     });
  });

  Template.tabs.events({

    'click .tabs a' : function(e){
      var target = $(e.currentTarget);
      $('.tabs a').removeClass('active');
      target.addClass('active');
      $('.content').hide();
      if(target.attr('id') === "create-tab")
      {
        $("#create").show();
      }
      else if(target.attr('id') === "manage-tab")
      {
        $('#selectall').prop("checked", false);
        $("#create").hide();
        $("#manage").show();
      }
    }
  });


  Template.createBook.events({

      'click #add-book' : function(e){

        var title = document.getElementById("title-field");
        var author = document.getElementById("author-field");
        var date = document.getElementById("date-field");
        var isbn = document.getElementById("isbn-field");

        if( title.value  == '' ||
            author.value == '' ||
            date.value   == '' ||
            isbn.value   == '' ){

          alert('Enter values in all fields');
          return;
        }

        else{
          var book = {
            title :  title.value,
            author :  author.value,
            date :  date.value,
            isbn : isbn.value
          };

          var _id = Meteor.call('add', book);
        }

        title.value = '';
        author.value = '';
        date.value = '';
        isbn.value = '';
      }
    });

  Template.activeBook.events({

      'click #update-book' : function(){

        var title = document.getElementById("title-field-edit");
        var author = document.getElementById("author-field-edit");
        var date = document.getElementById("date-field-edit");
        var isbn = document.getElementById("isbn-field-edit");

        if( title.value  == '' ||
            author.value == '' ||
            date.value   == '' ||
            isbn.value   == '' ){

          alert('Enter values in all fields');
          return;
        }

        else{
          var book = {
            id: active_book,
            title :  title.value,
            author :  author.value,
            date :  date.value,
            isbn : isbn.value
          };

         Meteor.call('update', book);
         $("#manage-edit").hide();
         $("#manage").show();
        }
      }
    });

  Template.showBooks.events({

      'click .edit-book' : function(e){
        var id = e.currentTarget.name;
        active_book = id;
       // Session.set('selected_book', id);
        var book = Books.findOne({_id: id});

        $('#book-edit-form').find(':input[name]:enabled').each(function() {
            var self = $(this);
            if(self.attr('name') == 'title')
              self.val(book.title);
            if(self.attr('name') == 'author')
              self.val(book.author);
            if(self.attr('name') =='date')
              self.val(book.date);
            if(self.attr('name') == 'isbn')
              self.val(book.isbn);
        });
        $(".content").hide();
        $('#manage-edit').show();
      },

      'click #deleteSelected' : function(){
       var elm = $('#manage .select:checked');
       for(var i = 0; i < elm.length; i++){
          Meteor.call('remove', elm[i].name);
       }
       document.getElementById('select-info').innerHTML = '';
      },

      'click #selectall' : function(e){
        var rows = document.getElementById('manage-table').rows;
        var target = e.currentTarget;

        for(var i = 1; i < rows.length; i++){
          if(rows[i].id != 'select-info'){
           if(target.checked){
              rows[i].style.background = "whiteSmoke";
              rows[i].childNodes[1].childNodes[0].checked = true;
            }
            else if(!(target.checked)){
              rows[i].style.background = 'white';
              rows[i].childNodes[1].childNodes[0].checked = false;
            }
          }
        }
        var info = $('#select-info');
        var count = $('#manage .select:checked').length;
        var word = count>1?"books":"book";
        var html = '<tr id="select-info"><td colspan="6">('+count+') '+word+' selected. <a id="deleteSelected" href="javascript:void(0);">delete</a></td></tr>';

        if(Books.find({}).count() > 0){
          if(info.length === 0){
            $('#manage tbody').prepend(html);
          }
          else if(count>0){
            info.replaceWith($(html));
          }
          else{
            info.remove();
          }
        }
      },

      'click .delete-book' : function(e){
          var target = $(e.currentTarget);
          Meteor.call('remove', target.data('id'));
          $("#manage").show();
      },

      'click .select' : function(e){
        var target = e.currentTarget;
        var row = target.parentNode.parentNode;
        //var checkbox = row.find('.select');

        if(target.checked){
          row.style.background = "whiteSmoke";
        }
        else if(!(target.checked)){
          row.style.background = 'white';
        }

        var info = $('#select-info');
        var count = $('#manage .select:checked').length;
        var word = count>1?"books":"book";
        var html = '<tr id="select-info"><td colspan="6">('+count+') '+word+' selected. <a id="deleteSelected" href="javascript:void(0);">delete</a></td></tr>';

        if(Books.find({}).count() > 0){
          if(info.length === 0)
          {
            $('#manage tbody').prepend(html);
          }
          else if(count>0)
          {
            info.replaceWith($(html));
          }
          else
          {
            info.remove();
          }
        }

      }

   });

  Template.showBooks.showBooks = function(){
      Meteor.subscribe('get_all_books');
      return Books.find({});
  }

  var temp;

  /*Template.activeBook.activeBook = function(){
    var id = Session.get('selected_book');
    if(typeof id !== 'undefined' && id != null){

        temp = Books.find({_id: id}).fetch();
          $('#manage-edit').css('display', 'block');
          $('#create').css('display', 'none');
          $('#manage').css('display', 'none');
         console.log(id);
        return temp;

     }
  }*/
}


if (Meteor.isServer) {

  Meteor.methods({
    'add' : function(obj){
      var id = Books.insert({
          title: obj.title,
          author: obj.author,
          date: obj.date,
          isbn: obj.isbn
      });
      return id;
    },

    'remove' : function(id){
      Books.remove({_id: id});
    },

    'removeAll' : function(){
      Books.remove({});
    },

    'update' : function(obj){
      Books.update({_id: obj.id}, {$set: {title: obj.title, author: obj.author, date: obj.date, isbn: obj.isbn}}, {reactive: true});
    }
  });

  Meteor.publish('get_all_books', function(){
    return Books.find({});
  })

  Meteor.publish('get_active_book', function(id){
    return Books.find({_id: id});
  })

}
