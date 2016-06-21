import ko from 'knockout';
import templateMarkup from 'text!./activity-page.html';
import lessons from 'app/lessons';

const activityTypeToComponentNameMap = {
    'play': 'play-activity-page'
};

class ActivityPage {
    constructor(params) {
        var [chapterIdx, sectionIdx, activityIdx] = [params.chapterIdx, params.sectionIdx, params.activityIdx].map((idx) => parseInt(idx));
        this.activityComponent = ko.pureComputed(() => {
            var activityDataObj = lessons.getActivityData(chapterIdx, sectionIdx, activityIdx)();
            if (!activityDataObj)
                return { name: 'not-found-page', params: {} };
            return {
                name: activityTypeToComponentNameMap[activityDataObj.activity.type],
                params: {
                    activityData: activityDataObj
                }
            };
        });
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: ActivityPage, template: templateMarkup };
