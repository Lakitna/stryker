import { traverse } from '@babel/core';

// @ts-expect-error The babel types don't define "File" yet
import { File } from '@babel/core';

import { placeMutant } from '../mutant-placers';
import { mutate } from '../mutators';
import { declareGlobal, isTypeAnnotation, isImportDeclaration } from '../util/syntax-helpers';
import { AstFormat } from '../syntax';

import { AstTransformer } from '.';

export const transformBabel: AstTransformer<AstFormat.JS | AstFormat.TS> = ({ root, originFileName, rawContent }, mutantCollector) => {
  // Wrap the AST in a file, so `nodePath.buildError` works
  // https://github.com/babel/babel/issues/11889
  const file = new File({ filename: originFileName }, { code: rawContent, ast: root });
  traverse(file.ast, {
    enter(path) {
      if (isTypeAnnotation(path) || isImportDeclaration(path) || path.isDecorator()) {
        // Don't mutate type declarations or import statements
        path.skip();
      } else {
        mutate(path).forEach((mutant) => {
          mutantCollector.add(originFileName, mutant);
        });
      }
    },
    exit(path) {
      const mutants = mutantCollector.findUnplacedMutantsInScope(path.node);
      if (placeMutant(path, mutants)) {
        path.skip();
        mutantCollector.markMutantsAsPlaced(mutants);
      }
    },
  });
  root.program.body.unshift(declareGlobal);
};
