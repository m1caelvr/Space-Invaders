export default class DeviceControlManager {
    constructor() {
      this.deviceType = this.detectDevice();
    }
  
    detectDevice() {
      const width = window.innerWidth;
  
      if (width <= 768) {
        return "mobile";
      } else if (width > 768 && width <= 1024) {
        return "tablet";
      } else {
        return "desktop";
      }
    }
}