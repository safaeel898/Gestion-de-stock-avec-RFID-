'use strict';

class GroupZonesAndZones {
    rules() {
        return {
            zone_id: 'required',
            group_zone_id: 'required',
        };
    }
    message() {
        return {
            'zone_id.required': ' *Zone name is required!',
            'group_zone_id.required': '*Group name required!',
        };
    }
}

module.exports = GroupZonesAndZones;