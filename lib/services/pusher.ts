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

// Helper function to bind to an event
export const bind = (channel: string, event: string, callback: (data: any) => void) => {
  const pusherChannel = pusher.channel(channel);
  if (pusherChannel) {
    pusherChannel.bind(event, callback);
  }
};

// Helper function to unbind from an event
export const unbind = (channel: string, event: string, callback: (data: any) => void) => {
  const pusherChannel = pusher.channel(channel);
  if (pusherChannel) {
    pusherChannel.unbind(event, callback);
  }
};
