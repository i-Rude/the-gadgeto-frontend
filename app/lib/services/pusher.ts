import Pusher from 'pusher-js';

const pusherConfig = {
  appId: '2050466',
  key: 'cdfc8abb8d9230af175c',
  cluster: 'ap1',
  forceTLS: true
};

export const pusher = new Pusher(pusherConfig.key, {
  cluster: pusherConfig.cluster,
  forceTLS: pusherConfig.forceTLS,
});

// Helper function to subscribe to a channel
export const subscribe = (channelName: string) => {
  return pusher.subscribe(channelName);
};

// Helper function to unsubscribe from a channel
export const unsubscribe = (channelName: string) => {
  pusher.unsubscribe(channelName);
};

// Helper function to bind an event to a channel
export const bind = (channelName: string, eventName: string, callback: Function) => {
  const channel = pusher.channel(channelName);
  if (channel) {
    channel.bind(eventName, callback);
  }
};

// Helper function to unbind an event from a channel
export const unbind = (channelName: string, eventName: string, callback?: Function) => {
  const channel = pusher.channel(channelName);
  if (channel) {
    if (callback) {
      channel.unbind(eventName, callback);
    } else {
      channel.unbind(eventName);
    }
  }
};