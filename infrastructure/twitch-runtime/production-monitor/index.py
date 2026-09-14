import datetime
import os
import boto3
cloudwatch = boto3.client("cloudwatch")
dynamodb = boto3.client("dynamodb")
ecs = boto3.client("ecs")
DIMENSIONS = [{"Name": "Environment", "Value": os.environ["ENVIRONMENT"]}, {"Name": "Service", "Value": os.environ["SERVICE_NAME"]}]
def metric(name, value, unit="Count"):
    cloudwatch.put_metric_data(Namespace="ProjectRespawn/TwitchRuntime", MetricData=[{"MetricName": name, "Dimensions": DIMENSIONS, "Timestamp": datetime.datetime.now(datetime.timezone.utc), "Value": value, "Unit": unit}])
def handler(event, _context):
    if event.get("detail", {}).get("lastStatus") == "STOPPED":
        metric("TaskExitCount", 1)
        return {"recorded": "task-exit"}
    service = ecs.describe_services(cluster=os.environ["CLUSTER_NAME"], services=[os.environ["SERVICE_NAME"]])["services"][0]
    metric("RunningTaskCount", service.get("runningCount", 0))
    item = dynamodb.get_item(TableName=os.environ["HEARTBEAT_TABLE_NAME"], Key={"integrationId": {"S": os.environ["INTEGRATION_ID"]}}, ProjectionExpression="lastBotHeartbeatAt").get("Item")
    heartbeat = (item or {}).get("lastBotHeartbeatAt", {}).get("S")
    if not heartbeat:
        metric("HeartbeatAgeSeconds", 86400, "Seconds")
        return {"running": service.get("runningCount", 0), "heartbeat": "missing"}
    parsed = datetime.datetime.fromisoformat(heartbeat.replace("Z", "+00:00"))
    age = max(0, (datetime.datetime.now(datetime.timezone.utc) - parsed).total_seconds())
    metric("HeartbeatAgeSeconds", age, "Seconds")
    return {"running": service.get("runningCount", 0), "heartbeatAgeSeconds": age}
