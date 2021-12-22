'use strict';

class PermissionAccess {
    rules() {
        return {
            group_zone_id: 'required',
            user_id: 'required',
            start_hour: 'required',
            end_hour: 'required',
            day_week: 'required',
            repeat_by: 'required',
        };
    }

    message() {
        return {
            'group_zone_id.required': '*Group zone required!',
            'user_id.required': '*Username required!',
            'start_hour.required': '*Start hour invalid',
            'end_hour.required': 'End hour invalid',
            'day_week.required': '*Day of week required',
            'repeat_by.required': '*Option invalid',
        };
    }
}

module.exports = PermissionAccess;
