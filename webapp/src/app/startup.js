import 'modernizr';
import 'jquery';
import 'bootstrap';
import ko from 'knockout';
import 'knockout-projections';
import * as router from './router';
import sysRuntime from 'app/sys-runtime';
import LiveEdit from 'app/live-edit';

new LiveEdit(sysRuntime);

// Components can be packaged as AMD modules, such as the following:
// ko.components.register('home-page', { require: 'components/home-page/home' });

// ... or for template-only components, you can just point to a .html file directly:
// ko.components.register('about-page', {
//     template: { require: 'text!components/about-page/about.html' }
// });

ko.components.register('play-activity-page', { require: 'components/play-activity-page/play-activity-page' });
ko.components.register('playground-layout', { require: 'components/playground-layout/playground-layout' });
ko.components.register('editor', { require: 'components/editor/editor' });
ko.components.register('editor-pane', { require: 'components/editor-pane/editor-pane' });
ko.components.register('compiler-controls', { require: 'components/compiler-controls/compiler-controls' });
ko.components.register('editor-compiler-tab', { require: 'components/editor-compiler-tab/editor-compiler-tab' });
ko.components.register('playground-term-pane', { require: 'components/playground-term-pane/playground-term-pane' });
ko.components.register('playground-footer', { require: 'components/playground-footer/playground-footer' });
ko.components.register('vm-state-label', { require: 'components/vm-state-label/vm-state-label' });
ko.components.register('compiler-state-label', { require: 'components/compiler-state-label/compiler-state-label' });
ko.components.register('file-browser', { require: 'components/file-browser/file-browser' });
// [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

// Start the application
ko.applyBindings({ route: router.currentRoute });