const View = use('View');
const Database = use('Database');
const PermissionAccess = use('App/Models/PermissionAccess');
const HistoryController = use('App/Controllers/Http/HistoryController');
const ValidatorPermissionAccess = use('App/Validators/PermissionAccess');
async function RHTest(id,dateIn){
    const leaves = await Database.select("leaves.type","users.firstname","users.familyname").from("leaves")
    .leftJoin('users', 'users.id', 'leaves.user_id')
    .where('leaves.user_id',id)
    .where('leaves.startDate','<=',dateIn)
    .where('leaves.endDate','>=',dateIn)
    
    const missions = await Database.select("missions.type","users.firstname","users.familyname").from("missions")
    .leftJoin('users', 'users.id', 'missions.user_id')
    .where('missions.user_id',id)
    .where('missions.dateInMission','<=',dateIn)
    .where('missions.dateOutMission','>=',dateIn)

    const notEmploye = await Database.select("users.firstname","users.familyname").from("users")
    .where('users.id',id)
    where('users.status', 2)

    
let access=true

    if (leaves[0] != null ){
        console.log("tableau pas nul")
        console.log(leaves)
        access=false
        console.log("access1: "+access)
    }
    if (missions[0] != null ){
        console.log("tableau pas nul")
        console.log(missions)
        access=false
        console.log("access2: "+access)
    }
    return access
}
async function AccessTest(user_id, reader_name, date) {
    const dates = new Date(date);
    dates.setTime(dates.getTime() - dates.getTimezoneOffset() * 60 * 1000);
    const history = new HistoryController();
    const permission_accesses = await Database.select('permission_accesses.*', 'readers.reader_name')
        .from('permission_accesses')
        .join('group_zones', 'group_zones.id', 'permission_accesses.group_zone_id')
        .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'group_zones.id ')
        .join('zones', 'zones.id', 'group_zone_zones.zone_id')
        .join('readers', 'readers.zone_id', 'zones.id')
        .where('permission_accesses.user_id', '=', user_id)
        .andWhere('readers.reader_name', '=', reader_name);

    const Bookingaccesses = await Database.select('readers.reader_name', 'bookings.*')
        .from('bookings')
        .join('group_zones', 'group_zones.id', 'bookings.group_zone_id')
        .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'group_zones.id ')
        .join('zones', 'zones.id', 'group_zone_zones.zone_id')
        .join('readers', 'readers.zone_id', 'zones.id')
        .where('bookings.user_id', '=', user_id)
        .andWhere('readers.reader_name', '=', reader_name);

    const subscriptionaccesses = await Database.select('readers.reader_name', 'subscriptions.*')
        .from('subscriptions')
        .join('group_zones', 'group_zones.id', 'subscriptions.group_zone_id')
        .join('group_zone_zones', 'group_zone_zones.group_zone_id', 'group_zones.id ')
        .join('zones', 'zones.id', 'group_zone_zones.zone_id')
        .join('readers', 'readers.zone_id', 'zones.id')
        .where('subscriptions.user_id', '=', user_id)
        .andWhere('readers.reader_name', '=', reader_name);

    if (permission_accesses[0]) {
        for (var i = 0; i < permission_accesses.length; i++) {
            const start_hour = new Date(hoursFormate(permission_accesses[i].start_hour)).getTime();
            const end_hour = new Date(hoursFormate(permission_accesses[i].end_hour)).getTime();
            const newTime = new Date(
                hoursFormate(dates.getUTCHours() + ':' + dates.getMinutes() + ':' + dates.getSeconds())
            ).getTime();
            if (newTime >= start_hour && newTime <= end_hour) {
                history.store(user_id, date, reader_name);
                return true;
            }
        }
    }

    if (Bookingaccesses[0]) {
        for (var i = 0; i < Bookingaccesses.length; i++) {
            const booking_start = new Date(Bookingaccesses[i].start_date);
            const booking_end = new Date(Bookingaccesses[i].end_date);
            booking_start.setTime(booking_start.getTime() - dates.getTimezoneOffset() * 60 * 1000);
            booking_end.setTime(booking_end.getTime() - dates.getTimezoneOffset() * 60 * 1000);
            if (dates >= booking_start && dates <= booking_end) {
                history.store(user_id, date, reader_name);
                return true;
            }
        }
    }
    if (subscriptionaccesses[0]) {
        for (var i = 0; i < subscriptionaccesses.length; i++) {
            const sub_start = new Date(subscriptionaccesses[i].start_date);
            const sub_end = new Date(subscriptionaccesses[i].end_date);
            sub_start.setTime(sub_start.getTime() - dates.getTimezoneOffset() * 60 * 1000);
            sub_end.setTime(sub_end.getTime() - dates.getTimezoneOffset() * 60 * 1000);
            if (dates >= sub_start && dates <= sub_end) {
                history.store(user_id, date, reader_name);
                return true;
            }
        }
    }
    return false;
}
function hoursFormate(time) {
    var array = time.split(':');
    const seconds = parseInt(array[0], 10) * 60 * 60 + parseInt(array[1], 10) * 60 + parseInt(array[2], 10);
    return new Date(seconds * 1000);
}
                                       

module.exports={RHTest, AccessTest}