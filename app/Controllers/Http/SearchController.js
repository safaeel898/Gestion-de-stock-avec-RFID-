'use strict';

const searchData = require('../../../public/js/custom/globalSearchData');

class SearchController {
    index({ response, request, view }) {
        const res = request.all();

        return view.render('index', {
            search: res.search,
        });
    }
    searchApi({ response }) {
        return response.json({
            data: searchData.name,
        });
    }
}

module.exports = SearchController;
