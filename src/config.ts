const config = {
    repository: {
      name: 'svg-sprite',
      iconExtractPath: 'libs/common/components/Icon',
      baseBranchName: 'main',
      owner: 'KwangEun-Ahn',
    },
    commit: {
      message: '[feat] update icons',
      author: {
        name: 'KwangEun-Ahn',
        email: 'ahnkwang7379@gmail.com',
      },
    },
    pr: {
      title: '[feat] update icons',
      body: 'pr Test',
      labels: ['feat:icon'],
    },
  };
  
  export default config;