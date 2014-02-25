/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 12/2/14
 * Time: 6:15 PM
 * To change this template use File | Settings | File Templates.
 */

var xmpp_connection = require('./xmpp_conn')
    , xmpp = require('node-xmpp')
    , os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var xmpp_room = function (roomName, userNickname){
    this.hostname = os.hostname();
    this.roomInfo = {};
    this.roomName = roomName;
    this.userNickname = userNickname;

    this.connection = xmpp_connection.getConnection();
    var _self = this;

    function handleRoomStanza(stanza){
        if(stanza.is('presence')){
            var configRoomMsg = new xmpp.Element('iq', {from: _self.connection.jid, id: stanza.id, to: _self.roomInfo.roomJid, type:'set' }).c('query', {xmlns:'http://jabber.org/protocol/muc#owner'
            });
            _self.connection.send(configRoomMsg);
        }
        else if(stanza.is('iq') && stanza.attrs.id && stanza.attrs.id.search('room-create1-') != -1){
            if(stanza.attrs.type == 'result'){
                var createRoomForm = new xmpp.Element('iq', {from: _self.connection.jid, id:'room-create2-' + _self.roomInfo.roomName, to: _self.roomInfo.roomJid, type:'set' }).c('query', {xmlns:'http://jabber.org/protocol/muc#owner'}).
                    c('x', {xmlns:'jabber:x:data', type:'submit'}).
                    c('field',{var:'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up().
                    c('field',{var:'muc#roomconfig_roomname'}).c('value').t(_self.roomInfo.roomName).up().up().
                    c('field',{var:'muc#roomconfig_roomdesc'}).c('value').t('mpeers room').up().up().
                    c('field',{var:'muc#roomconfig_enablelogging'}).c('value').t(1).up().up().
                    c('field',{var:'muc#roomconfig_changesubject'}).c('value').t(1).up().up().
                    c('field',{var:'muc#roomconfig_allowinvites'}).c('value').t(0).up().up().
                    c('field',{var:'muc#roomconfig_maxusers'}).c('value').t(10).up().up().
                    c('field',{var:'muc#roomconfig_publicroom'}).c('value').t(0).up().up().
                    c('field',{var:'muc#roomconfig_persistentroom'}).c('value').t(1).up().up().
                    c('field',{var:'muc#roomconfig_moderatedroom'}).c('value').t(0).up().up().
                    c('field',{var:'muc#roomconfig_membersonly'}).c('value').t(0).up().up().
                    c('field',{var:'muc#roomconfig_passwordprotectedroom'}).c('value').t(0).up().up().
                    c('field',{var:'muc#roomconfig_whois'}).c('value').t('anyone').up().up().
                    c('field',{var:'muc#maxhistoryfetch'}).c('value').t(50).up().up().
                    c('field',{var:'muc#roomconfig_allowpm'}).c('value').t('anyone').up().up().up().up();
                //console.log(createUserForm)
                _self.connection.send(createRoomForm);
            }

        }
        else if(stanza.is('iq') && stanza.attrs.id && stanza.attrs.id.search('room-create2-') != -1){
            if(stanza.attrs.type == 'result'){
                console.log('xmpp: room created ' + _self.roomInfo.roomName);
                _self.emit('RoomCreated', _self.roomInfo.roomName);
            }
            else if(stanza.attrs.type == 'error')
                console.log('xmpp: room creation error');
            _self.connection.removeListener('stanza', handleRoomStanza);
        }
    }

    this.createRoom = function(){
        this.roomInfo.roomName = this.roomName;
        this.roomInfo.nickName = this.userNickname;

        this.roomInfo.roomJid = this.roomName + '@conference.' + this.hostname;
        var createRoomMsg = new xmpp.Element('presence', {from: this.connection.jid, id: 'room-create1-' + this.roomName, to: this.roomInfo.roomJid + '/' + this.userNickname}).c('x', {xmlns:'http://jabber.org/protocol/muc'});
        this.connection.send(createRoomMsg);

        this.connection.on('stanza', handleRoomStanza);
    }
}

util.inherits(xmpp_room, EventEmitter);

module.exports = xmpp_room;