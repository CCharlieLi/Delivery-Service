'use strict';

module.exports = class Graph {
  /**
   * Initiate graph nodes
   * @param {object} nodes { a: { b: 1, c: 2 }, b: { c: 2 } }
   */
  constructor(nodes = {}) {
    this.refresh(nodes);
  }

  /**
   * Refresh graph with new nodes
   * @param {object} nodes
   */
  refresh(nodes = {}) {
    this.nodes = nodes;
  }

  /**
   * Find all nodes that paths start from given node
   * @param {string} node
   */
  from(node) {
    return this.nodes[node];
  }

  /**
   * Find all nodes that paths end at given node
   * @param {string} node
   */
  to(node) {
    let nodes = {};
    for (let i in this.nodes) {
      for (let j in this.nodes[i]) {
        if (j === node) nodes[i] = { [j]: this.nodes[i][j] };
      }
    }
    return nodes;
  }

  /**
   * Add path
   * @param {string} start
   * @param {string} end
   * @param {number} cost default as 1
   */
  set(start, end, cost = 1) {
    this.nodes[start] = this.nodes[start] || {};
    this.nodes[start][end] = cost;
    return this.nodes;
  }

  /**
   * Remove path
   * @param {string} start
   * @param {string} end
   */
  remove(start, end) {
    if (this.nodes[start]) delete this.nodes[start][end];
    return this.nodes;
  }

  /**
   * Find all routes sorted by cost with optimized BFS(or Dijkstra)
   * @param {string} start
   * @param {string} end
   * @param {object} options { routeLimit: Infinity, stopLimit: Infinity, costLimit: Infinity, pathReuseLimit: 1 }
   */
  findRoutes(start, end, options = {}) {
    const routeLimit = (options && options.routeLimit) || Infinity;
    const stopLimit = (options && options.stopLimit) || Infinity;
    const costLimit = (options && options.costLimit) || Infinity;
    const pathReuseLimit = (options && options.pathReuseLimit) || 1;

    // init start point route
    let targetRoutes = [];
    let tmpRoutes = [{ nodes: [start], paths: {}, cost: 0 }];

    while (targetRoutes.length < routeLimit) {
      // break if no more routes
      let route = tmpRoutes.shift();
      if (!route) break;

      // save to target routes if reached to end point
      let lastNode = route.nodes[route.nodes.length - 1];
      if (route.cost !== 0 && lastNode === end) {
        if (route.cost <= costLimit) targetRoutes.push(route);
        if (pathReuseLimit === 1) continue;
      }

      // continue if no further path for given node
      let nodes = this.from(lastNode);
      if (!nodes) continue;

      // push new nodes into previous route to generate new routes
      for (let node in nodes) {
        if (!route.paths[`${lastNode}-${node}`] || route.paths[`${lastNode}-${node}`] < pathReuseLimit) {
          const pathCount = route.paths[`${lastNode}-${node}`] ? route.paths[`${lastNode}-${node}`] + 1 : 1;
          tmpRoutes.push({
            nodes: route.nodes.concat(node),
            paths: { ...route.paths, [`${lastNode}-${node}`]: pathCount },
            cost: route.cost + nodes[node],
          });
        }
      }

      // sort routes by cost
      tmpRoutes = tmpRoutes.sort((prev, next) => prev.cost - next.cost);
    }

    // filter routes by stops
    return targetRoutes.filter((route) => route.nodes.length <= stopLimit + 1);
  }
};
