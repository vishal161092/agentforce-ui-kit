@JsonAccess(serializable='always' deserializable='always')
global class VideoMessageInfo {
    @AuraEnabled
    global String caption;

    global VideoMessageInfo() {
        this.caption = '';
    }
}
