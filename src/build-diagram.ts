import { BuildConfig } from './import-graph-uml';

export const buildDiagram: BuildConfig['buildDiagram'] = async (builder) => {
  // Const toHide = [
  //   '@nestjs/core',
  //   '@nestjs/common',
  //   '@nestjs/testing',
  //   '@nestjs/swagger',
  //   'nestjs-swagger-dto',
  //   'express',
  //   'lodash',
  //   'class-validator',
  //   'class-transformer',
  //   '@nestjs/terminus',
  //   'panic-fn',
  //   'env-var-base',
  //   'nestjs-pubsub-core',
  //   '~/common/pagination',
  //   '~/common/constants',
  // ];
  // builder.unlink((node) => toHide.includes(node.name));
  // builder.unlink((node) => node.name.startsWith('@hiiretail/iam-libs'));
  // builder.unlink((node) => node.name.startsWith('~/config/'));
  // builder.unlink((node) => node.name.includes('.spec'));
  // builder.unlink((node) => node.name.includes('.dto'));
  // builder.unlink((node) => node.name.includes('.param'));
  // builder.unlink((node) => node.name.includes('.entity'));
  // builder.unlink((node) => node.name.includes('.query'));
  // builder.unlink((node) => node.name.includes('.decorator'));
  // builder.unlink(node => !node.name.includes('.module') && !node.name.includes('.service') && !node.name.includes('.controller'));
  builder.unlink((node) => !node.name.includes('.module'));

  for (const node of builder.getNodes()) {
    if (node.name.split('/').length > 3) {
      node.name = node.name.split('/').slice(2, -1).join('/');
    } else {
      node.name = node.name.slice('~/src/'.length, -'.module'.length);
    }
  }

  builder.append('@startuml');

  for (const node of builder.getNodes()) {
    builder.appendNode(node);
  }

  for (const [a, b] of builder.getLinks()) {
    builder.appendLink(a, b);
  }

  builder.append('@enduml');

  return builder.build();
};
