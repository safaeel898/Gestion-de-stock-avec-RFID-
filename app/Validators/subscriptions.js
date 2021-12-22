'use strict';

class subscriptions {
    rules() {
        return {
            end_date: 'required',
            type_subscription_id: 'required',
            group_zone_id: 'required',
            start_date: 'required',
            user_id: 'required',
        };
    }

    message() {
        return {
            'start_date.required': ' *Start date is invalid!',
            'group_zone_id.required': '*Group zone required!',
            'type_subscription_id.required': '*Type subscription required!',
            'user_id.required': '*Username required!',
            'end_date.required': '*End date is invalid!',
        };
    }
}

module.exports = subscriptions;
