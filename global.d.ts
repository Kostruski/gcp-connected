export = {};

declare global {
  interface Window {
    firebaseui: {
      auth: {
        AuthUI: any;
      };
    };
  }
}
