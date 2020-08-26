module.exports = function (config) {
  config.set({
    mutate: ['src/*.js'],
    testRunner: 'karma',
    reporters: ['clear-text', 'html', 'event-recorder'],
    concurrency: 2,
    karma: {
      config: {
        files: ['src/*.js', 'test/*.js'],
        client: {
          clearContext: false
        }
      }
    },
    timeoutMS: 60000
  });
};
