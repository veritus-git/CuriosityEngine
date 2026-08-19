class Router {
    constructor(routes, onRouteChanged) {
        this.routes = routes;
        this.onRouteChanged = onRouteChanged;
        
        // Listen for browser back/forward buttons
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Intercept all link clicks for SPA routing
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.origin === window.location.origin && !link.hasAttribute('data-external')) {
                e.preventDefault();
                this.navigate(link.pathname);
            }
        });
    }

    navigate(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
            this.handleRoute();
        }
    }

    handleRoute() {
        const path = window.location.pathname;
        let matchedRoute = '/';
        
        // Find matching route, default to '/'
        for (const route of Object.keys(this.routes)) {
            if (path === route || (route !== '/' && path.startsWith(route))) {
                matchedRoute = route;
                break;
            }
        }
        
        let viewName = this.routes[matchedRoute];
        if (typeof viewName === 'function') {
            viewName = viewName();
        }
        
        this.onRouteChanged(viewName, path);
    }
}
