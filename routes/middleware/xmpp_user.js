/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 19/11/13
 * Time: 4:34 PM
 * To change this template use File | Settings | File Templates.
 */
var connection = require('./xmpp_conn')
    , xmpp = require('node-xmpp')
    , User = require('../../data/models/user');

connection.on('stanza', handleStanza);

function handleStanza(stanza){
    if(stanza.is('iq') && stanza.attrs.id.search('create1-') != -1){
        if(stanza.attrs.type == 'result'){
            User.findOne({_id: stanza.attrs.id.substr(8)}, function(err, user) {
                if (!err && user) {
                    //console.log("good so far: " + stanza.getChild('command').attrs.status + ": " + stanza.attrs.sessionid);
                    var pass = "";
                    if(user.password && user.password != '')
                        pass = user.password;
                    else
                        pass = user.username;
                    var createUserForm = new xmpp.Element('iq', {from:'viki@vikram',id:'create2-' + user._id, to:'vikram', type:'set' }).c('command', {xmlns:'http://jabber.org/protocol/commands',
                        node:'http://jabber.org/protocol/admin#add-user', sessionid: stanza.getChild('command').attrs.sessionid}).c('x', {xmlns:'jabber:x:data', type:'submit'}).
                        c('field',{type:'hidden',var:'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/admin').up().up().
                        c('field',{var:'accountjid'}).c('value').t(user.username + '@vikram').up().up().
                        c('field',{var:'password'}).c('value').t(pass).up().up().
                        c('field',{var:'password-verify'}).c('value').t(pass).up().up().
                        c('field',{var:'email'}).c('value').t(user.email).up().up().
                        c('field',{var:'given_name'}).c('value').t(user.displayname).up().up().
                        c('field',{var:'surname'}).c('value').t('').up().up().up().up();
                    //console.log(createUserForm)
                    connection.send(createUserForm);
                }
            });
        }
    }
    else if(stanza.is('iq') && stanza.attrs.id.search('create2-') != -1){
        if(stanza.attrs.type == 'result')
            console.log('xmpp: registered user ' + stanza.attrs.id);
        else if(stanza.attrs.type == 'error')
            console.log('xmpp: registration error');
    }
};

module.exports.createUser = function(newUser){
        var createUserMsg = new xmpp.Element('iq', {from:'viki@vikram',id: 'create1-' + newUser._id, to:'vikram', type:'set' }).c('command', {xmlns:'http://jabber.org/protocol/commands',
            node:'http://jabber.org/protocol/admin#add-user', action:'execute'});
        connection.send(createUserMsg);
}