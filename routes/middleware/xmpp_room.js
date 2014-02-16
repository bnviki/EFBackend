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

var hostname = os.hostname();
var roomInfo = {};

var connection = xmpp_connection.getConnection();
connection.on('stanza', handleStanza);

function handleStanza(stanza){
    if(stanza.is('presence')){
        var configRoomMsg = new xmpp.Element('iq', {from: connection.jid, id: stanza.id, to: roomInfo.roomJid, type:'set' }).c('query', {xmlns:'http://jabber.org/protocol/muc#owner'
        });
        connection.send(configRoomMsg);
    }
    else if(stanza.is('iq') && stanza.attrs.id && stanza.attrs.id.search('room-create1-') != -1){
        if(stanza.attrs.type == 'result'){
            var createRoomForm = new xmpp.Element('iq', {from: connection.jid, id:'room-create2-' + roomInfo.roomName, to: roomInfo.roomJid, type:'set' }).c('query', {xmlns:'http://jabber.org/protocol/muc#owner'}).
                c('x', {xmlns:'jabber:x:data', type:'submit'}).
                c('field',{var:'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up().
                c('field',{var:'muc#roomconfig_roomname'}).c('value').t(roomInfo.roomName).up().up().
                c('field',{var:'muc#roomconfig_roomdesc'}).c('value').t('mpeers room').up().up().
                c('field',{var:'muc#roomconfig_enablelogging'}).c('value').t(0).up().up().
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
            connection.send(createRoomForm);
        }

    }
    else if(stanza.is('iq') && stanza.attrs.id && stanza.attrs.id.search('room-create2-') != -1){
        if(stanza.attrs.type == 'result')
            console.log('xmpp: room created ' + roomInfo.roomName);
        else if(stanza.attrs.type == 'error')
            console.log('xmpp: room creation error');
    }
};

module.exports.createRoom = function(roomName, userNickname){
    roomInfo.roomName = roomName;
    roomInfo.nickName = userNickname;

    roomInfo.roomJid = roomName + '@conference.' + hostname;
    var createRoomMsg = new xmpp.Element('presence', {from: connection.jid, id: 'room-create1-' + roomName, to: roomInfo.roomJid + '/' + userNickname}).c('x', {xmlns:'http://jabber.org/protocol/muc'});
    connection.send(createRoomMsg);
}