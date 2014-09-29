/*
 *
 * Find more about this plugin by visiting
 * http://alxgbsn.co.uk/
 *
 * Copyright (c) 2010-2012 Alex Gibson
 * Released under MIT license
 *
 * Forked by @dmbwien
 * Adapated by @dmb-dz
 */

;(function (window, document) {

    function Shake() {

        //feature detect
        this.hasDeviceMotion = 'ondevicemotion' in window;
        this.hasDeviceOrientation = 'orientation' in window;

        // store the orientation as we need to change X/Y values
        this.orientation = window.orientation || 0;

        //default velocity threshold for shake to register
        // TODO - make configurable
        this.motionThreshold = 10;

        this.orientationDirection = -1;

        //use date to prevent multiple shakes firing
        this.lastTime = new Date();

        //accelerometer values
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
    }

    //create custom event
    Shake.prototype.getEventObject = function() {
        var event;
        if (typeof document.CustomEvent === "function") {
            event = new document.CustomEvent('shake', {
                bubbles: true,
                cancelable: true
            });
            return event;
        } else if (typeof document.createEvent === "function") {
            event = document.createEvent('Event');
            event.initEvent('shake', true, true);
            return event;
        } else {
          return false;
        }
    };

    //reset timer values
    Shake.prototype.reset = function () {
        this.lastTime = new Date();
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
    };

    //start listening for devicemotion
    Shake.prototype.start = function () {
        this.reset();
        if (this.hasDeviceMotion) {
            window.addEventListener('devicemotion', this, false);
        }
        if (this.hasDeviceOrientation) {
            window.addEventListener('orientationchange', this, false);
        }
    };

    //stop listening for devicemotion
    Shake.prototype.stop = function () {
        if (this.hasDeviceMotion) {
            window.removeEventListener('devicemotion', this, false);
        }
        if (this.hasDeviceOrientation) {
            window.removeEventListener('orientationchange', this, false);
        }
        this.reset();
    };

    //calculates if shake did occur
    Shake.prototype.devicemotion = function (e) {
        var current = e.acceleration || e.accelerationIncludingGravity;
        this.checkShake(this.motionThreshold, current.x, current.y, current.z);
    };

    Shake.prototype.orientationchange = function(e) {
        this.orientation = window.orientation;

        this.orientationDirection *= -1;
        if (Math.abs(orientation) != 90) {
            x = 15 * this.orientationDirection;
            y = 0;
        } else {
            x = 0;
            y = 15 * this.orientationDirection;
        }

        this.checkShake(-1, x, y, 0);
    };

    //calculates if shake did occur
    Shake.prototype.checkShake = function(threshold, x, y, z) {

        var currentTime,
            timeDifference,
            deltaX = 0,
            deltaY = 0,
            deltaZ = 0,
            deltaXAbs = 0,
            deltaYAbs = 0,
            deltaZAbs = 0
        ;

        if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
            this.lastX = x;
            this.lastY = y;
            this.lastZ = z;
            return;
        }

        deltaX = this.lastX - x;
        deltaY = this.lastY - y;
        deltaZ = this.lastZ - z;
        deltaXAbs = Math.abs(deltaX);
        deltaYAbs = Math.abs(deltaY);
        deltaZAbs = Math.abs(deltaZ);

        if (((deltaXAbs > threshold) && (deltaYAbs > threshold)) ||
            ((deltaXAbs > threshold) && (deltaZAbs > threshold)) ||
            ((deltaYAbs > threshold) && (deltaZAbs > threshold)))
        {
            //calculate time in milliseconds since last shake registered
            currentTime = new Date();
            timeDifference = currentTime.getTime() - this.lastTime.getTime();

            // TODO - make configurable
            if (timeDifference > 500) {
                this.lastTime = new Date();

                var event = this.getEventObject();
                if (Math.abs(orientation) != 90) {
                    event.x = deltaX;
                    event.y = deltaY;
                } else {
                    event.x = deltaY;
                    event.y = deltaX;
                }
                event.z = deltaZ;

                window.dispatchEvent(event);
            }
        }

        this.lastX = x;
        this.lastY = y;
        this.lastZ = z;

    };

    //event handler
    Shake.prototype.handleEvent = function (e) {

        if (typeof (this[e.type]) === 'function') {
            return this[e.type](e);
        }
    };

    //create a new instance of shake.js.
    var myShakeEvent = new Shake();
    myShakeEvent && myShakeEvent.start();

}(window, document));
