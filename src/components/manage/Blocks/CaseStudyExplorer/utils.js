export function centerAndResetMapZoom({ map, ol }) {
  map.getView().animate({
    zoom: 4,
    duration: 1000,
    center: ol.proj.transform([10, 49], 'EPSG:4326', 'EPSG:3857'),
  });
}

export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  element.scrollIntoView({
    behavior: 'smooth',
  });
}

export function getExtentOfFeatures({ features, ol }) {
  const points = features.map((f) => f.getGeometry().flatCoordinates);
  const point = new ol.geom.MultiPoint(points);
  return point.getExtent();
}

export function zoomMapToFeatures({ map, features, threshold = 500, ol }) {
  const extent = getExtentOfFeatures({ features, ol });
  let extentBuffer = (extent[3] - extent[1] + extent[2] - extent[0]) / 4;
  extentBuffer = extentBuffer < threshold ? threshold : extentBuffer;
  const paddedExtent = ol.extent.buffer(extent, extentBuffer);
  map.getView().fit(paddedExtent, { ...map.getSize(), duration: 1000 });
}

export function getFeatures({ cases, ol }) {
  const Feature = ol.ol.Feature;

  return cases.map((c, index) => {
    const {
      geometry: { coordinates },
    } = c;
    const point = new Feature(
      new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
    );
    point.setId(index);
    point.setProperties(
      {
        title: c.properties.title,
        image: c.properties.image,
        nwrm_type: c.properties.nwrm_type,
        measures_implemented: c.properties.measures,
        typology_of_measures: c.properties.typology_of_measures,
        description: c.properties.description,
        index: index,
        path: c.properties.path,
        color: c.properties.nwrm_type === 'Light' ? '#50B0A4' : '#0083E0',
      },
      false,
    );
    return point;
  });
}

export function filterCases(cases, activeFilters, caseStudiesIds, searchInput) {
  const data = cases.filter((_case) => {
    let flag_searchInput = false;
    let flag_implemented = false;
    let flag_typology_of_measures = false;
    let flag_case = caseStudiesIds
      ? caseStudiesIds.includes(_case.properties.url.split('/').pop())
      : true;

    if (!searchInput) {
      flag_searchInput = true;
    } else {
      if (_case.properties.title.toLowerCase().match(searchInput)) {
        flag_searchInput = true;
      } else if (
        _case.properties.description.toLowerCase().match(searchInput)
      ) {
        flag_searchInput = true;
      }
    }

    if (!activeFilters.measures_implemented.length) {
      flag_implemented = true;
    } else {
      let measures_implemented = _case.properties.measures?.map((item) => {
        return item['id'].toString();
      });

      activeFilters.measures_implemented.forEach((filter) => {
        if (measures_implemented?.includes(filter)) flag_implemented = true;
      });
    }

    if (!activeFilters.typology_of_measures.length) {
      flag_typology_of_measures = true;
    } else {
      let typology_of_measures = _case.properties.typology_of_measures?.map(
        (item) => {
          return item.toString();
        },
      );

      activeFilters.typology_of_measures.forEach((filter) => {
        if (typology_of_measures?.includes(filter))
          flag_typology_of_measures = true;
      });
    }

    return flag_case &&
      flag_implemented &&
      flag_typology_of_measures &&
      flag_searchInput
      ? _case
      : false;
  });

  return data;
}

export function getFilters(cases) {
  let _filters = {
    measures_implemented: {},
    typology_of_measures: {},
  };

  for (let key of Object.keys(cases)) {
    const _case = cases[key];
    let measures_implemented = _case.properties.measures;
    measures_implemented.map((item) => {
      if (!_filters.measures_implemented.hasOwnProperty(item['id'])) {
        _filters.measures_implemented[item['id']] = item['title'];
      }
      return [];
    });

    let typology_of_measures = _case.properties.typology_of_measures;
    typology_of_measures.map((item) => {
      if (!_filters.typology_of_measures.hasOwnProperty(item)) {
        _filters.typology_of_measures[item] = item;
      }
      return [];
    });
  }

  return _filters;
}
