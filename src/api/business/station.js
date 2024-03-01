import request from '@/utils/request'

// 查询工位列表
export function listStation(query) {
  return request({
    url: '/business/station/list',
    method: 'get',
    params: query
  })
}

// 查询工位详细
export function getStation(stationId) {
  return request({
    url: '/business/station/' + stationId,
    method: 'get'
  })
}

// 新增工位
export function addStation(data) {
  return request({
    url: '/business/station',
    method: 'post',
    data: data
  })
}

// 修改工位
export function updateStation(data) {
  return request({
    url: '/business/station',
    method: 'put',
    data: data
  })
}

// 删除工位
export function delStation(stationId) {
  return request({
    url: '/business/station/' + stationId,
    method: 'delete'
  })
}
