import { ProjectType, DependencyType } from './affected-apps';
import { createGraphviz, NodeEdgeVariant } from './dep-graph';

describe('dep-graph', () => {
  describe('getNodeProps', () => {
    const projectMap = {
      app1: {
        name: 'app1',
        root: 'apps/app1',
        type: ProjectType.app,
        tags: [],
        files: []
      },
      app2: {
        name: 'app2',
        root: 'apps/app2',
        type: ProjectType.app,
        tags: [],
        files: []
      },
      lib1: {
        name: 'lib1',
        root: 'libs/lib1',
        type: ProjectType.lib,
        tags: [],
        files: []
      },
      lib2: {
        name: 'lib2',
        root: 'libs/lib2',
        type: ProjectType.lib,
        tags: [],
        files: []
      },
      lib3: {
        name: 'lib3',
        root: 'libs/lib3',
        type: ProjectType.lib,
        tags: [],
        files: []
      }
    };

    const deps = {
      app1: {
        props: projectMap.app1,
        deps: []
      },
      app2: {
        props: projectMap.app2,
        deps: [
          {
            projectName: 'lib1',
            type: DependencyType.es6Import
          }
        ]
      },
      lib1: {
        props: projectMap.lib1,
        deps: []
      },
      lib2: {
        props: projectMap.lib2,
        deps: [
          {
            projectName: 'lib1',
            type: DependencyType.es6Import
          }
        ]
      },
      lib3: {
        props: projectMap.lib3,
        deps: []
      }
    };

    const graphvizOptions = {
      graph: [],
      nodes: {
        [ProjectType.app]: {
          [NodeEdgeVariant.default]: {},
          [NodeEdgeVariant.highlighted]: {}
        },
        [ProjectType.lib]: {
          [NodeEdgeVariant.default]: {},
          [NodeEdgeVariant.highlighted]: {
            color: 'red'
          }
        }
      },
      edges: {
        [DependencyType.es6Import]: {
          [NodeEdgeVariant.default]: {},
          [NodeEdgeVariant.highlighted]: {}
        },
        [DependencyType.loadChildren]: {
          [NodeEdgeVariant.default]: {},
          [NodeEdgeVariant.highlighted]: {}
        },
        [DependencyType.implicit]: {
          [NodeEdgeVariant.default]: {},
          [NodeEdgeVariant.highlighted]: {}
        }
      }
    };

    it('should generate the default dot output', () => {
      const resp = createGraphviz(graphvizOptions, deps, {});

      expect(resp).toContain('"app1";');
      expect(resp).toContain('"app2";');
      expect(resp).toContain('"lib1";');
      expect(resp).toContain('"lib2";');
      expect(resp).toContain('"lib3";');
      expect(resp).toContain('"app2" -> "lib1";');
      expect(resp).toContain('"lib2" -> "lib1";');
    });

    it('should add style for highlighted nodes', () => {
      const modifiedOptions = {
        ...graphvizOptions,
        ...{
          nodes: {
            ...graphvizOptions.nodes,
            ...{
              [ProjectType.lib]: {
                [NodeEdgeVariant.default]: {},
                [NodeEdgeVariant.highlighted]: {
                  color: 'red'
                }
              }
            }
          }
        }
      };

      const resp = createGraphviz(modifiedOptions, deps, {
        lib1: true
      });

      expect(resp).toContain('"lib1" [ color = "red" ];');
    });

    it('should add style for highlighted edges', () => {
      const modifiedOptions = {
        ...graphvizOptions,
        ...{
          nodes: {
            ...graphvizOptions.nodes,
            ...{
              [ProjectType.lib]: {
                [NodeEdgeVariant.default]: {},
                [NodeEdgeVariant.highlighted]: {}
              }
            }
          },
          edges: {
            ...graphvizOptions.edges,
            [DependencyType.es6Import]: {
              [NodeEdgeVariant.default]: {},
              [NodeEdgeVariant.highlighted]: {
                color: 'blue'
              }
            }
          }
        }
      };

      const resp = createGraphviz(modifiedOptions, deps, {
        lib1: true
      });

      expect(resp).toContain('"lib1";');
      expect(resp).not.toContain('"lib1" [ color = "red" ];');

      expect(resp).toContain('"app2" -> "lib1" [ color = "blue" ];');

      expect(resp).toContain('"lib2" -> "lib1" [ color = "blue" ];');
    });

    it('should style all variants correctly', () => {
      const newDeps = {
        app1: {
          props: projectMap.app1,
          deps: [
            {
              projectName: 'lib1',
              type: DependencyType.es6Import
            }
          ]
        },
        app2: {
          props: projectMap.app2,
          deps: [
            {
              projectName: 'lib1',
              type: DependencyType.loadChildren
            }
          ]
        },
        lib1: {
          props: projectMap.lib1,
          deps: []
        },
        lib2: {
          props: projectMap.lib2,
          deps: [
            {
              projectName: 'lib1',
              type: DependencyType.implicit
            }
          ]
        },
        lib3: {
          props: projectMap.lib3,
          deps: []
        }
      };

      const modifiedOptions = {
        ...graphvizOptions,
        ...{
          nodes: {
            [ProjectType.app]: {
              [NodeEdgeVariant.default]: {
                color: 'app-def'
              },
              [NodeEdgeVariant.highlighted]: {
                color: 'app-highlight'
              }
            },
            [ProjectType.lib]: {
              [NodeEdgeVariant.default]: {
                color: 'lib-def'
              },
              [NodeEdgeVariant.highlighted]: {
                color: 'lib-highlight'
              }
            }
          },
          edges: {
            [DependencyType.es6Import]: {
              [NodeEdgeVariant.default]: {
                color: 'es6Import-def'
              },
              [NodeEdgeVariant.highlighted]: {
                color: 'es6Import-highlight'
              }
            },
            [DependencyType.loadChildren]: {
              [NodeEdgeVariant.default]: {
                color: 'loadChildren-def'
              },
              [NodeEdgeVariant.highlighted]: {
                color: 'loadChildren-highlight'
              }
            },
            [DependencyType.implicit]: {
              [NodeEdgeVariant.default]: {
                color: 'implicit-def'
              },
              [NodeEdgeVariant.highlighted]: {
                color: 'implicit-highlight'
              }
            }
          }
        }
      };

      const resp = createGraphviz(modifiedOptions, newDeps, {
        app1: true,
        app2: true,
        lib1: true
      });

      expect(resp).toContain('"app1" [ color = "app-highlight" ];');
      expect(resp).toContain('"app2" [ color = "app-highlight" ];');

      expect(resp).toContain('"lib1" [ color = "lib-highlight" ];');

      expect(resp).toContain('"lib2" [ color = "lib-def" ];');
      expect(resp).toContain('"lib3" [ color = "lib-def" ];');

      expect(resp).toContain(
        '"app1" -> "lib1" [ color = "es6Import-highlight" ];'
      );
      expect(resp).toContain(
        '"app2" -> "lib1" [ color = "loadChildren-highlight" ];'
      );
      expect(resp).toContain(
        '"lib2" -> "lib1" [ color = "implicit-highlight" ];'
      );

      const respNoCriticalPath = createGraphviz(modifiedOptions, newDeps, {});

      expect(respNoCriticalPath).toContain(
        '"app1" -> "lib1" [ color = "es6Import-def" ];'
      );
      expect(respNoCriticalPath).toContain(
        '"app2" -> "lib1" [ color = "loadChildren-def" ];'
      );
      expect(respNoCriticalPath).toContain(
        '"lib2" -> "lib1" [ color = "implicit-def" ];'
      );
    });
  });
});
