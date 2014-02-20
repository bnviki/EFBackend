/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 19/11/13
 * Time: 4:34 PM
 * To change this template use File | Settings | File Templates.
 */
var xmpp_connection = require('./xmpp_conn')
    , xmpp = require('node-xmpp')
    , User = require('../../data/models/user')
    , os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var xmpp_user = function (newUser){
    this.hostname = os.hostname();
    this.connection = xmpp_connection.getConnection();
    this.userInfo = newUser;
    var _self = this;

    function handleUserStanza(stanza){
        if(stanza.is('iq') && stanza.attrs.id && stanza.attrs.id.search('user-create1-') != -1){
            if(stanza.attrs.type == 'result'){
                var createUserForm = new xmpp.Element('iq', {from: _self.connection.jid, id:'user-create2-' + _self.userInfo._id, to: _self.hostname, type:'set' }).c('command', {xmlns:'http://jabber.org/protocol/commands',
                    node:'http://jabber.org/protocol/admin#add-user', sessionid: stanza.getChild('command').attrs.sessionid}).c('x', {xmlns:'jabber:x:data', type:'submit'}).
                    c('field',{type:'hidden',var:'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/admin').up().up().
                    c('field',{var:'accountjid'}).c('value').t(_self.userInfo.username + '@' + _self.hostname).up().up().
                    c('field',{var:'password'}).c('value').t(_self.userInfo.password).up().up().
                    c('field',{var:'password-verify'}).c('value').t(_self.userInfo.password).up().up().
                    c('field',{var:'email'}).c('value').t(_self.userInfo.email).up().up().
                    c('field',{var:'given_name'}).c('value').t(_self.userInfo.displayname).up().up().
                    c('field',{var:'surname'}).c('value').t('').up().up().up().up();
                _self.connection.send(createUserForm);
            }
        }
        else if(stanza.is('iq') && stanza.attrs.id && stanza.attrs.id.search('user-create2-') != -1){
            if(stanza.attrs.type == 'result'){
                console.log('xmpp: registered user ' + stanza.attrs.id);
                _self.emit('UserCreated', _self.userInfo);
            }
            else if(stanza.attrs.type == 'error')
                console.log('xmpp: registration error');
            _self.connection.removeListener('stanza', handleUserStanza);
        }
    };

    this.createUser = function(){
        var createUserMsg = new xmpp.Element('iq', {from: this.connection.jid, id: 'user-create1-' + this.userInfo._id, to: this.hostname, type:'set' }).c('command', {xmlns:'http://jabber.org/protocol/commands',
            node:'http://jabber.org/protocol/admin#add-user', action:'execute'});
        this.connection.send(createUserMsg);
        this.connection.on('stanza', handleUserStanza);
    }
}

util.inherits(xmpp_user, EventEmitter);

module.exports = xmpp_user;