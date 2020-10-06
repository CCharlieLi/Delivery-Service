'use strict';

require('should');
const Graph = require('../server/lib/graph');

describe('Graph lib', () => {
  let graph;
  beforeEach('init graph', () => {
    graph = new Graph({
      A: { B: 1, C: 4, D: 10 },
      B: { E: 3 },
      C: { D: 4, F: 2 },
      D: { E: 1 },
      E: { B: 3, A: 2 },
      F: { D: 1 },
    });
  });

  it('should contruct graph', () => {
    graph.nodes.should.have.properties(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('should refresh graph', () => {
    graph.refresh({ J: { A: 10 } });
    graph.nodes.should.deepEqual({ J: { A: 10 } });
    graph.nodes.J.A.should.be.equal(10);
  });

  it('should get all nodes from a given node', () => {
    graph.from('A').should.deepEqual({ B: 1, C: 4, D: 10 });
  });

  it('should get all nodes to a given node', () => {
    graph.to('B').should.deepEqual({ A: { B: 1 }, E: { B: 3 } });
  });

  it('should set a new path', () => {
    graph.set('A', 'J', 12);
    graph.nodes.should.deepEqual({
      A: { B: 1, C: 4, D: 10, J: 12 },
      B: { E: 3 },
      C: { D: 4, F: 2 },
      D: { E: 1 },
      E: { B: 3, A: 2 },
      F: { D: 1 },
    });
  });

  it('should update a existent path', () => {
    graph.set('A', 'B', 12);
    graph.nodes.should.deepEqual({
      A: { B: 12, C: 4, D: 10 },
      B: { E: 3 },
      C: { D: 4, F: 2 },
      D: { E: 1 },
      E: { B: 3, A: 2 },
      F: { D: 1 },
    });
  });

  it('should remove a existent path', () => {
    graph.remove('A', 'B');
    graph.nodes.should.deepEqual({
      A: { C: 4, D: 10 },
      B: { E: 3 },
      C: { D: 4, F: 2 },
      D: { E: 1 },
      E: { B: 3, A: 2 },
      F: { D: 1 },
    });
  });

  it('should remove a non-existent path', () => {
    graph.remove('A', 'J');
    graph.nodes.should.deepEqual({
      A: { B: 1, C: 4, D: 10 },
      B: { E: 3 },
      C: { D: 4, F: 2 },
      D: { E: 1 },
      E: { B: 3, A: 2 },
      F: { D: 1 },
    });
  });

  it('should return empty array when node not found', () => {
    const routes = graph.findRoutes('AA', 'D', { stopLimit: 4 });
    routes.length.should.be.equal(0);
  });

  it('should find all routes from a given start point to a given end point', () => {
    const routes = graph.findRoutes('E', 'E');
    routes.forEach((each) => {
      each.cost.should.be.ok;
      each.paths.should.be.ok;
      each.nodes.should.be.ok;
    });
    routes.length.should.be.equal(5);
    routes[0].cost.should.be.equal(6);
  });

  it('should find all routes from a given start point to a given end point with stop limit', () => {
    const routes = graph.findRoutes('E', 'D', { stopLimit: 4 });
    routes.forEach((each) => {
      each.cost.should.be.ok;
      each.paths.should.be.ok;
      each.nodes.should.be.ok;
    });
    routes.length.should.be.equal(4);
    routes[0].cost.should.be.equal(9);
  });

  it('should find all routes from a given start point to a given end point with cost limit', () => {
    const routes = graph.findRoutes('E', 'E', { costLimit: 10 });
    routes.forEach((each) => {
      each.cost.should.be.belowOrEqual(10);
      each.paths.should.be.ok;
      each.nodes.should.be.ok;
    });
    routes.length.should.be.equal(3);
  });

  it('should find all routes from a given start point to a given end point with route limit', () => {
    const routes = graph.findRoutes('E', 'E', { routeLimit: 1 });
    routes[0].cost.should.be.equal(6);
    routes.length.should.be.equal(1);
  });

  it('should find all routes from a given start point to a given end point with pathReuseLimit', () => {
    const routes = graph.findRoutes('E', 'E', { costLimit: 20, pathReuseLimit: 2 });
    routes.forEach((each) => {
      each.cost.should.be.belowOrEqual(20);
      each.paths.should.be.ok;
      each.nodes.should.be.ok;
    });
    routes.length.should.be.equal(22);
  });
});
