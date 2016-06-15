import ko from 'knockout';
import crossroads from 'crossroads';
import hasher from 'hasher';
import tracker from 'app/ga-tracker';

// This module configures crossroads.js, a routing library. If you prefer, you
// can use any other routing library (or none at all) as Knockout is designed to
// compose cleanly with external libraries.
//
// You *don't* have to follow the pattern established here (each route entry
// specifies a 'page', which is a Knockout component) - there's nothing built into
// Knockout that requires or even knows about this technique. It's just one of
// many possible ways of setting up client-side routes.

class Router {
    constructor(config) {
        this.currentRoute = ko.observable({});

        // Configure Crossroads route handlers
        crossroads.addRoute('', (requestParams) => {
            // TODO: Remove redirection once home page is ready
            //this.currentRoute(ko.utils.extend(requestParams, { page: 'home-page' }));
            hasher.replaceHash('/VM');
        });

        crossroads.addRoute('VM', (requestParams) => {
            this.currentRoute(ko.utils.extend(requestParams, { page: 'play-activity-page' }));
        });

        crossroads.routed.add(() => {
            tracker.trackPageView();
        });

        crossroads.bypassed.add(() => {
            tracker.trackPageView();
            this.currentRoute({ page: 'not-found-page' });
        });

        // Activate Crossroads
        crossroads.normalizeFn = crossroads.NORM_AS_OBJECT;
        hasher.initialized.add(hash => crossroads.parse(hash));
        hasher.changed.add(hash => crossroads.parse(hash));
        hasher.init();
    }
}

// Create and export router instance
var routerInstance = new Router();

export default routerInstance;
